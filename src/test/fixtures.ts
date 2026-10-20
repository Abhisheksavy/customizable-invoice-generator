import type { InvoiceInput } from "@/shared/dto/invoice.dto";

/** A valid invoice matching the brief's check: 2 × $50 − $10 discount + 10% tax = $99.00. */
export function buildInvoiceInput(overrides: Partial<InvoiceInput> = {}): InvoiceInput {
  return {
    invoiceNumber: "INV-0001",
    issueDate: "2026-10-01",
    dueDate: "2026-10-15",
    business: {
      name: "Juniper Studio",
      email: "billing@juniper.example",
      address: "12 Alder Lane",
    },
    customer: {
      name: "Harbor Coffee Co.",
      email: "accounts@harbor.example",
      address: "88 Pier Road",
    },
    lineItems: [{ description: "Brand workshop", quantity: 2, unitPriceCents: 5000 }],
    discountCents: 1000,
    taxRatePercent: 10,
    customFields: [{ label: "PO number", value: "PO-4471", visible: true }],
    notes: "Thank you for your business.",
    accentColor: "ink",
    ...overrides,
  };
}
