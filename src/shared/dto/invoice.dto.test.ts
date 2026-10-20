import { describe, expect, it } from "vitest";
import { buildInvoiceInput } from "@/test/fixtures";
import { invoiceInputSchema, type InvoiceInput } from "./invoice.dto";

/** Returns the first validation message per field path. */
function errorsFor(input: InvoiceInput): Record<string, string> {
  const result = invoiceInputSchema.safeParse(input);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) errors[issue.path.join(".")] ??= issue.message;
  return errors;
}

const withItem = (item: Partial<InvoiceInput["lineItems"][number]>) =>
  buildInvoiceInput({
    lineItems: [{ description: "Design", quantity: 1, unitPriceCents: 1000, ...item }],
    discountCents: 0,
  });

describe("invoiceInputSchema", () => {
  it("accepts a complete invoice and trims text", () => {
    const input = buildInvoiceInput({ customer: { name: "  Harbor  ", email: "", address: "" } });

    const result = invoiceInputSchema.parse(input);

    expect(result.customer.name).toBe("Harbor");
  });

  it("rejects negative and zero quantities", () => {
    expect(errorsFor(withItem({ quantity: -2 }))).toEqual({
      "lineItems.0.quantity": "Quantity can't be negative",
    });
    expect(errorsFor(withItem({ quantity: 0 }))).toEqual({
      "lineItems.0.quantity": "Quantity must be more than 0",
    });
  });

  it("rejects negative prices and fractions of a cent", () => {
    expect(errorsFor(withItem({ unitPriceCents: -100 }))).toEqual({
      "lineItems.0.unitPriceCents": "Price can't be negative",
    });
    expect(errorsFor(withItem({ unitPriceCents: 1234.5 }))).toEqual({
      "lineItems.0.unitPriceCents": "Use up to 2 decimal places",
    });
  });

  it("rejects a discount that is negative or larger than the subtotal", () => {
    expect(errorsFor(buildInvoiceInput({ discountCents: -1 }))).toEqual({
      discountCents: "Discount can't be negative",
    });
    expect(errorsFor(buildInvoiceInput({ discountCents: 10001 }))).toEqual({
      discountCents: "Discount can't exceed the $100.00 subtotal",
    });
  });

  it("allows a discount equal to the subtotal", () => {
    expect(errorsFor(buildInvoiceInput({ discountCents: 10000 }))).toEqual({});
  });

  it("rejects tax rates below 0% or above 100%", () => {
    expect(errorsFor(buildInvoiceInput({ taxRatePercent: -5 }))).toEqual({
      taxRatePercent: "Tax rate can't be negative",
    });
    expect(errorsFor(buildInvoiceInput({ taxRatePercent: 120 }))).toEqual({
      taxRatePercent: "Tax rate can't exceed 100%",
    });
  });

  it("rejects a due date before the issue date", () => {
    expect(
      errorsFor(buildInvoiceInput({ issueDate: "2026-10-10", dueDate: "2026-10-01" })),
    ).toEqual({
      dueDate: "Due date can't be before the issue date",
    });
  });

  it("checks the discount even when an unrelated field is invalid", () => {
    const input = buildInvoiceInput({
      discountCents: 50000,
      customer: { name: "", email: "", address: "" },
    });

    expect(errorsFor(input)).toEqual({
      "customer.name": "Name is required",
      discountCents: "Discount can't exceed the $100.00 subtotal",
    });
  });

  it("requires a label and value on custom fields", () => {
    const input = buildInvoiceInput({ customFields: [{ label: " ", value: "", visible: false }] });

    expect(errorsFor(input)).toEqual({
      "customFields.0.label": "Label is required",
      "customFields.0.value": "Value is required",
    });
  });
});
