import type { InvoiceDto, InvoiceInput, InvoiceSummaryDto } from "@/shared/dto/invoice.dto";
import { calculateTotals } from "@/shared/invoice/calculate-totals";
import type { InvoiceRecord, InvoiceSummaryRow, InvoiceWithChildren } from "./invoice.repository";

interface RecordMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

/** Builds the rows to store, with line and invoice totals computed on the server. */
export function toInvoiceRecord(input: InvoiceInput, meta: RecordMeta): InvoiceRecord {
  const totals = calculateTotals(input);

  return {
    invoice: {
      ...meta,
      invoiceNumber: input.invoiceNumber,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      businessName: input.business.name,
      businessEmail: input.business.email,
      businessAddress: input.business.address,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerAddress: input.customer.address,
      discountCents: input.discountCents,
      taxRatePercent: input.taxRatePercent,
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      notes: input.notes,
      accentColor: input.accentColor,
    },
    lineItems: input.lineItems.map((item, position) => ({
      invoiceId: meta.id,
      position,
      ...item,
      lineTotalCents: totals.lineTotalsCents[position] ?? 0,
    })),
    customFields: input.customFields.map((field, position) => ({
      invoiceId: meta.id,
      position,
      ...field,
    })),
  };
}

/** Maps stored rows to the invoice DTO returned by the API. */
export function toInvoiceDto(row: InvoiceWithChildren): InvoiceDto {
  return {
    id: row.id,
    status: row.sentAt ? "sent" : "draft",
    invoiceNumber: row.invoiceNumber,
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    business: { name: row.businessName, email: row.businessEmail, address: row.businessAddress },
    customer: { name: row.customerName, email: row.customerEmail, address: row.customerAddress },
    lineItems: row.lineItems.map(({ description, quantity, unitPriceCents, lineTotalCents }) => ({
      description,
      quantity,
      unitPriceCents,
      lineTotalCents,
    })),
    discountCents: row.discountCents,
    taxRatePercent: row.taxRatePercent,
    customFields: row.customFields.map(({ label, value, visible }) => ({ label, value, visible })),
    notes: row.notes,
    accentColor: row.accentColor,
    totals: {
      subtotalCents: row.subtotalCents,
      discountCents: row.discountCents,
      taxCents: row.taxCents,
      totalCents: row.totalCents,
    },
    sentAt: row.sentAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Maps a list row to the summary DTO. */
export function toInvoiceSummaryDto(row: InvoiceSummaryRow): InvoiceSummaryDto {
  return { ...row, status: row.sentAt ? "sent" : "draft" };
}
