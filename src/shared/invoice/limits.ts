/** Upper bounds shared by the editor, the API and the database. */
export const INVOICE_LIMITS = {
  lineItems: 100,
  customFields: 20,
  quantity: 100_000,
  quantityDecimals: 3,
  unitPriceCents: 100_000_000,
  taxRatePercent: 100,
  taxRateDecimals: 3,
  invoiceNumberLength: 32,
  nameLength: 120,
  emailLength: 254,
  addressLength: 300,
  descriptionLength: 200,
  customFieldLabelLength: 40,
  customFieldValueLength: 120,
  notesLength: 1000,
} as const;
