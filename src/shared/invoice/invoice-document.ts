import type { InvoiceInput, PartyInput } from "../dto/invoice.dto";
import { ACCENT_COLORS, DEFAULT_ACCENT_COLOR } from "./accent-colors";
import { calculateTotals, type InvoiceTotals } from "./calculate-totals";

export interface InvoiceDocument {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  business: PartyInput;
  customer: PartyInput;
  lineItems: {
    description: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
  totals: InvoiceTotals;
  taxRatePercent: number;
  customFields: { label: string; value: string }[];
  notes: string;
  accent: (typeof ACCENT_COLORS)[keyof typeof ACCENT_COLORS];
}

/** Builds exactly what the client sees; preview, print and email all render this, so hidden fields never leak. */
export function toInvoiceDocument(invoice: InvoiceInput): InvoiceDocument {
  const totals = calculateTotals(invoice);

  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    business: invoice.business,
    customer: invoice.customer,
    lineItems: invoice.lineItems.map((item, index) => ({
      ...item,
      lineTotalCents: totals.lineTotalsCents[index] ?? 0,
    })),
    totals,
    taxRatePercent: invoice.taxRatePercent,
    customFields: invoice.customFields
      .filter((field) => field.visible && field.label.trim() !== "")
      .map(({ label, value }) => ({ label, value })),
    notes: invoice.notes,
    accent: ACCENT_COLORS[invoice.accentColor] ?? ACCENT_COLORS[DEFAULT_ACCENT_COLOR],
  };
}
