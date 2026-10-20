import { asc, desc, eq, sql } from "drizzle-orm";
import type { Database } from "../db/client";
import { invoiceCustomFields, invoiceLineItems, invoices } from "../db/schema";

export type InvoiceRow = typeof invoices.$inferSelect;

export type InvoiceWithChildren = InvoiceRow & {
  lineItems: (typeof invoiceLineItems.$inferSelect)[];
  customFields: (typeof invoiceCustomFields.$inferSelect)[];
};

export interface InvoiceRecord {
  invoice: typeof invoices.$inferInsert;
  lineItems: (typeof invoiceLineItems.$inferInsert)[];
  customFields: (typeof invoiceCustomFields.$inferInsert)[];
}

const summaryColumns = {
  id: invoices.id,
  invoiceNumber: invoices.invoiceNumber,
  customerName: invoices.customerName,
  issueDate: invoices.issueDate,
  dueDate: invoices.dueDate,
  totalCents: invoices.totalCents,
  sentAt: invoices.sentAt,
};

export type InvoiceSummaryRow = { [Key in keyof typeof summaryColumns]: InvoiceRow[Key] };

export class InvoiceRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /** Lists invoices newest first, without line items. */
  listSummaries(): Promise<InvoiceSummaryRow[]> {
    return this.db
      .select(summaryColumns)
      .from(invoices)
      .orderBy(desc(invoices.issueDate), desc(invoices.createdAt));
  }

  /** Loads an invoice with its line items and custom fields in display order. */
  findById(id: string): Promise<InvoiceWithChildren | undefined> {
    return this.db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        lineItems: { orderBy: asc(invoiceLineItems.position) },
        customFields: { orderBy: asc(invoiceCustomFields.position) },
      },
    });
  }

  /** Returns the most recently created invoice. */
  findLatest(): Promise<InvoiceRow | undefined> {
    return this.db.query.invoices.findFirst({ orderBy: desc(invoices.createdAt) });
  }

  /** True when another invoice already uses this number, ignoring case. */
  async isNumberTaken(invoiceNumber: string): Promise<boolean> {
    const match = await this.db
      .select({ id: invoices.id })
      .from(invoices)
      .where(sql`lower(${invoices.invoiceNumber}) = lower(${invoiceNumber})`)
      .limit(1);
    return match.length > 0;
  }

  /** Inserts an invoice and its children in one transaction. */
  async insert(record: InvoiceRecord): Promise<void> {
    await this.db.batch([
      this.db.insert(invoices).values(record.invoice),
      ...this.insertChildren(record),
    ]);
  }

  /** Overwrites an invoice and replaces its children in one transaction. */
  async replace(record: InvoiceRecord): Promise<void> {
    const id = record.invoice.id;
    await this.db.batch([
      this.db.update(invoices).set(record.invoice).where(eq(invoices.id, id)),
      this.db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id)),
      this.db.delete(invoiceCustomFields).where(eq(invoiceCustomFields.invoiceId, id)),
      ...this.insertChildren(record),
    ]);
  }

  /** Deletes an invoice (children cascade); returns false when it didn't exist. */
  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning({ id: invoices.id });
    return deleted.length > 0;
  }

  /** Records when the invoice was last emailed. */
  async markSent(id: string, sentAt: string): Promise<void> {
    await this.db.update(invoices).set({ sentAt, updatedAt: sentAt }).where(eq(invoices.id, id));
  }

  private insertChildren({ lineItems, customFields }: InvoiceRecord) {
    return [
      ...(lineItems.length > 0 ? [this.db.insert(invoiceLineItems).values(lineItems)] : []),
      ...(customFields.length > 0
        ? [this.db.insert(invoiceCustomFields).values(customFields)]
        : []),
    ];
  }
}
