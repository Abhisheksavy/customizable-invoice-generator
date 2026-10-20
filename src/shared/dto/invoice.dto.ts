import { z } from "zod";
import { formatCents } from "../format";
import { ACCENT_COLOR_KEYS } from "../invoice/accent-colors";
import { calculateSubtotalCents } from "../invoice/calculate-totals";
import { INVOICE_LIMITS as LIMITS } from "../invoice/limits";
import { hasAtMostDecimals } from "../numbers";
import { optionalEmail, optionalText, requiredText } from "./fields";

const isoDate = (label: string) => z.iso.date({ error: `Enter a valid ${label}` });

/** Runs a cross-field rule only when the fields it reads have no errors of their own. */
const whenValid =
  (...keys: string[]) =>
  (payload: z.core.ParsePayload) =>
    !payload.issues.some((issue) => keys.includes(String(issue.path?.[0])));

export const partySchema = z.object({
  name: requiredText("Name", LIMITS.nameLength),
  email: optionalEmail,
  address: optionalText("Address", LIMITS.addressLength),
});

export const lineItemSchema = z.object({
  description: requiredText("Description", LIMITS.descriptionLength),
  quantity: z
    .number({ error: "Enter a quantity" })
    .min(0, "Quantity can't be negative")
    .positive("Quantity must be more than 0")
    .max(LIMITS.quantity, `Quantity can't exceed ${LIMITS.quantity.toLocaleString("en-US")}`)
    .refine(
      (value) => hasAtMostDecimals(value, LIMITS.quantityDecimals),
      "Use up to 3 decimal places",
    ),
  unitPriceCents: z
    .number({ error: "Enter a unit price" })
    .min(0, "Price can't be negative")
    .max(LIMITS.unitPriceCents, `Price can't exceed ${formatCents(LIMITS.unitPriceCents)}`)
    .int("Use up to 2 decimal places"),
});

export const customFieldSchema = z.object({
  label: requiredText("Label", LIMITS.customFieldLabelLength),
  value: requiredText("Value", LIMITS.customFieldValueLength),
  visible: z.boolean(),
});

export const invoiceInputSchema = z
  .object({
    invoiceNumber: requiredText("Invoice number", LIMITS.invoiceNumberLength),
    issueDate: isoDate("issue date"),
    dueDate: isoDate("due date"),
    business: partySchema,
    customer: partySchema,
    lineItems: z
      .array(lineItemSchema)
      .min(1, "Add at least one line item")
      .max(LIMITS.lineItems, `Invoices are limited to ${LIMITS.lineItems} line items`),
    discountCents: z
      .number({ error: "Enter a discount, or 0 for none" })
      .min(0, "Discount can't be negative")
      .int("Use up to 2 decimal places"),
    taxRatePercent: z
      .number({ error: "Enter a tax rate, or 0 for none" })
      .min(0, "Tax rate can't be negative")
      .max(LIMITS.taxRatePercent, "Tax rate can't exceed 100%")
      .refine(
        (value) => hasAtMostDecimals(value, LIMITS.taxRateDecimals),
        "Use up to 3 decimal places",
      ),
    customFields: z
      .array(customFieldSchema)
      .max(LIMITS.customFields, `Invoices are limited to ${LIMITS.customFields} custom fields`),
    notes: optionalText("Notes", LIMITS.notesLength),
    accentColor: z.enum(ACCENT_COLOR_KEYS, { error: "Pick an accent color" }),
  })
  .superRefine(
    (invoice, ctx) => {
      if (invoice.dueDate < invoice.issueDate) {
        ctx.addIssue({
          code: "custom",
          path: ["dueDate"],
          message: "Due date can't be before the issue date",
        });
      }
    },
    { when: whenValid("issueDate", "dueDate") },
  )
  .superRefine(
    (invoice, ctx) => {
      const subtotalCents = calculateSubtotalCents(invoice.lineItems);
      if (invoice.discountCents > subtotalCents) {
        ctx.addIssue({
          code: "custom",
          path: ["discountCents"],
          message: `Discount can't exceed the ${formatCents(subtotalCents)} subtotal`,
        });
      }
    },
    { when: whenValid("lineItems", "discountCents") },
  );

export type PartyInput = z.infer<typeof partySchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
export type CustomFieldInput = z.infer<typeof customFieldSchema>;
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;

export type InvoiceStatus = "draft" | "sent";

export interface InvoiceTotalsDto {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}

export interface InvoiceDto extends Omit<InvoiceInput, "lineItems"> {
  id: string;
  status: InvoiceStatus;
  lineItems: (LineItemInput & { lineTotalCents: number })[];
  totals: InvoiceTotalsDto;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummaryDto {
  id: string;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  totalCents: number;
  status: InvoiceStatus;
  sentAt: string | null;
}

export interface NewInvoiceDefaultsDto {
  invoiceNumber: string;
  business: PartyInput;
}
