import { addDays } from "../dates";
import type { InvoiceInput, PartyInput } from "../dto/invoice.dto";

const SAMPLE_BUSINESS: PartyInput = {
  name: "Juniper Studio",
  email: "hello@juniper.example",
  address: "48 Alder Street\nPortland, OR 97205",
};

/** Fictional invoices for the landing page and `npm run db:seed`, dated relative to `today`. */
export function sampleInvoices(today: string): [InvoiceInput, ...InvoiceInput[]] {
  return [
    {
      invoiceNumber: "INV-0003",
      issueDate: addDays(today, -5),
      dueDate: addDays(today, 9),
      business: SAMPLE_BUSINESS,
      customer: {
        name: "Harbor Coffee Co.",
        email: "ap@harborcoffee.example",
        address: "210 Pier Road\nSeattle, WA 98101",
      },
      lineItems: [
        { description: "Brand strategy workshop (half day)", quantity: 1, unitPriceCents: 120000 },
        { description: "Logo concepts, three directions", quantity: 3, unitPriceCents: 45000 },
        { description: "Packaging illustration (hours)", quantity: 6.5, unitPriceCents: 9500 },
      ],
      discountCents: 15000,
      taxRatePercent: 8.875,
      customFields: [
        { label: "PO number", value: "HC-4471", visible: true },
        { label: "Project", value: "Spring rebrand", visible: true },
        {
          label: "Internal note",
          value: "Extra revision rounds are billed hourly",
          visible: false,
        },
      ],
      notes: "Bank transfer within 14 days, please.\nThank you — it's a pleasure working with you.",
      accentColor: "ink",
    },
    {
      invoiceNumber: "INV-0002",
      issueDate: addDays(today, -21),
      dueDate: addDays(today, 9),
      business: SAMPLE_BUSINESS,
      customer: {
        name: "Northwind Bicycles",
        email: "ap@northwind.example",
        address: "5 Foundry Lane\nBoise, ID 83702",
      },
      lineItems: [
        { description: "Website art direction", quantity: 1, unitPriceCents: 280000 },
        { description: "Product photo retouching (per image)", quantity: 24, unitPriceCents: 3500 },
      ],
      discountCents: 0,
      taxRatePercent: 0,
      customFields: [{ label: "Project", value: "Fall catalogue", visible: true }],
      notes: "Payment due within 30 days. Thanks for the smooth collaboration!",
      accentColor: "forest",
    },
    {
      invoiceNumber: "INV-0001",
      issueDate: addDays(today, -44),
      dueDate: addDays(today, -30),
      business: SAMPLE_BUSINESS,
      customer: {
        name: "Maple & Rye Bakery",
        email: "hello@maplerye.example",
        address: "77 Market Street\nSan Francisco, CA 94103",
      },
      lineItems: [
        { description: "Menu redesign", quantity: 1, unitPriceCents: 95000 },
        { description: "Window signage", quantity: 2, unitPriceCents: 18500 },
      ],
      discountCents: 5000,
      taxRatePercent: 8.625,
      customFields: [{ label: "PO number", value: "MR-2026-14", visible: true }],
      notes: "",
      accentColor: "clay",
    },
  ];
}
