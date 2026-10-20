import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { ACCENT_COLOR_KEYS } from "@/shared/invoice/accent-colors";

export const invoices = sqliteTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    invoiceNumber: text("invoice_number").notNull(),
    issueDate: text("issue_date").notNull(),
    dueDate: text("due_date").notNull(),
    businessName: text("business_name").notNull(),
    businessEmail: text("business_email").notNull(),
    businessAddress: text("business_address").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerAddress: text("customer_address").notNull(),
    discountCents: integer("discount_cents").notNull(),
    taxRatePercent: real("tax_rate_percent").notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    taxCents: integer("tax_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    notes: text("notes").notNull(),
    accentColor: text("accent_color", { enum: ACCENT_COLOR_KEYS }).notNull(),
    sentAt: text("sent_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("invoices_number_unique").on(sql`lower(${table.invoiceNumber})`),
    index("invoices_issue_date_idx").on(table.issueDate),
  ],
);

export const invoiceLineItems = sqliteTable(
  "invoice_line_items",
  {
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    description: text("description").notNull(),
    quantity: real("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
  },
  (table) => [primaryKey({ columns: [table.invoiceId, table.position] })],
);

export const invoiceCustomFields = sqliteTable(
  "invoice_custom_fields",
  {
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    label: text("label").notNull(),
    value: text("value").notNull(),
    visible: integer("visible", { mode: "boolean" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.invoiceId, table.position] })],
);

export const invoiceRelations = relations(invoices, ({ many }) => ({
  lineItems: many(invoiceLineItems),
  customFields: many(invoiceCustomFields),
}));

export const invoiceLineItemRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceLineItems.invoiceId], references: [invoices.id] }),
}));

export const invoiceCustomFieldRelations = relations(invoiceCustomFields, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceCustomFields.invoiceId], references: [invoices.id] }),
}));
