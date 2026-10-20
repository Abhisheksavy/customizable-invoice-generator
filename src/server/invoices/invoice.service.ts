import type {
  InvoiceDto,
  InvoiceInput,
  InvoiceSummaryDto,
  NewInvoiceDefaultsDto,
} from "@/shared/dto/invoice.dto";
import type { SendInvoiceInput, SendInvoiceResultDto } from "@/shared/dto/send-invoice.dto";
import { toInvoiceDocument } from "@/shared/invoice/invoice-document";
import { isUniqueConstraintError } from "../db/constraint-errors";
import type { EmailProvider } from "../email/email-provider";
import { renderInvoiceEmail } from "../email/templates/invoice-email";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import { toInvoiceDto, toInvoiceRecord, toInvoiceSummaryDto } from "./invoice.mapper";
import type { InvoiceRepository } from "./invoice.repository";
import { nextInvoiceNumber } from "./next-invoice-number";

const MAX_NUMBER_SUGGESTION_ATTEMPTS = 50;

export class InvoiceService {
  private readonly invoices: InvoiceRepository;
  private readonly email: EmailProvider;

  constructor(invoices: InvoiceRepository, email: EmailProvider) {
    this.invoices = invoices;
    this.email = email;
  }

  /** Lists every invoice, newest first. */
  async list(): Promise<InvoiceSummaryDto[]> {
    const rows = await this.invoices.listSummaries();
    return rows.map(toInvoiceSummaryDto);
  }

  /** Loads one invoice or throws NotFoundError. */
  async get(id: string): Promise<InvoiceDto> {
    const row = await this.invoices.findById(id);
    if (!row) throw new NotFoundError("This invoice doesn't exist or was deleted.");
    return toInvoiceDto(row);
  }

  /** Suggests an unused invoice number and carries over the business details of the latest invoice. */
  async getNewInvoiceDefaults(): Promise<NewInvoiceDefaultsDto> {
    const latest = await this.invoices.findLatest();
    let invoiceNumber = nextInvoiceNumber(latest?.invoiceNumber);
    for (let attempt = 0; attempt < MAX_NUMBER_SUGGESTION_ATTEMPTS; attempt++) {
      if (!(await this.invoices.isNumberTaken(invoiceNumber))) break;
      invoiceNumber = nextInvoiceNumber(invoiceNumber);
    }

    return {
      invoiceNumber,
      business: {
        name: latest?.businessName ?? "",
        email: latest?.businessEmail ?? "",
        address: latest?.businessAddress ?? "",
      },
    };
  }

  /** Stores a new invoice; totals are recomputed here rather than trusted from the client. */
  async create(input: InvoiceInput): Promise<InvoiceDto> {
    const now = new Date().toISOString();
    const record = toInvoiceRecord(input, {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      sentAt: null,
    });
    await this.withUniqueNumber(input.invoiceNumber, () => this.invoices.insert(record));
    return this.get(record.invoice.id);
  }

  /** Replaces an invoice's content while keeping its id, creation date and sent status. */
  async update(id: string, input: InvoiceInput): Promise<InvoiceDto> {
    const existing = await this.get(id);
    const record = toInvoiceRecord(input, {
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      sentAt: existing.sentAt,
    });
    await this.withUniqueNumber(input.invoiceNumber, () => this.invoices.replace(record));
    return this.get(id);
  }

  /** Deletes an invoice or throws NotFoundError. */
  async delete(id: string): Promise<void> {
    const deleted = await this.invoices.delete(id);
    if (!deleted) throw new NotFoundError("This invoice doesn't exist or was deleted.");
  }

  /** Emails the saved invoice and records when it was sent. */
  async send(id: string, input: SendInvoiceInput): Promise<SendInvoiceResultDto> {
    const invoice = await this.get(id);
    const { html, text } = renderInvoiceEmail(toInvoiceDocument(invoice), input.message);
    const receipt = await this.email.send({
      senderName: invoice.business.name,
      to: input.to,
      replyTo: invoice.business.email || undefined,
      subject: input.subject,
      html,
      text,
    });

    const sentAt = new Date().toISOString();
    await this.invoices.markSent(id, sentAt);
    return { sentAt, previewUrl: receipt.previewUrl };
  }

  /** Turns a duplicate invoice number into a 409 that points at the field. */
  private async withUniqueNumber(invoiceNumber: string, write: () => Promise<void>): Promise<void> {
    try {
      await write();
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const message = `${invoiceNumber} is already used by another invoice`;
      throw new ConflictError(message, { fieldErrors: [{ path: "invoiceNumber", message }] });
    }
  }
}
