import { describe, expect, it } from "vitest";
import { nextInvoiceNumber } from "./next-invoice-number";

describe("nextInvoiceNumber", () => {
  it.each([
    [undefined, "INV-0001"],
    ["INV-0041", "INV-0042"],
    ["INV-0999", "INV-1000"],
    ["2026-007", "2026-008"],
    ["A12-B", "A13-B"],
    ["ACME", "ACME-2"],
  ])("follows %j with %j", (previous, expected) => {
    expect(nextInvoiceNumber(previous)).toBe(expected);
  });
});
