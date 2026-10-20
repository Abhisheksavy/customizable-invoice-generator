import { describe, expect, it } from "vitest";
import { calculateTotals, lineTotalCents } from "./calculate-totals";

describe("calculateTotals", () => {
  it("matches the brief: 2 × $50 − $10 discount + 10% tax = $99.00", () => {
    const totals = calculateTotals({
      lineItems: [{ quantity: 2, unitPriceCents: 5000 }],
      discountCents: 1000,
      taxRatePercent: 10,
    });

    expect(totals).toEqual({
      lineTotalsCents: [10000],
      subtotalCents: 10000,
      discountCents: 1000,
      taxCents: 900,
      totalCents: 9900,
    });
  });

  it("rounds each line to cents before summing", () => {
    const halfCentLine = { quantity: 0.5, unitPriceCents: 1 };
    const totals = calculateTotals({
      lineItems: [halfCentLine, halfCentLine, halfCentLine],
      discountCents: 0,
      taxRatePercent: 0,
    });

    // Rounding the sum instead (1.5¢) would give 2¢.
    expect(totals.lineTotalsCents).toEqual([1, 1, 1]);
    expect(totals.subtotalCents).toBe(3);
  });

  it("applies the discount before tax and rounds tax half-up once", () => {
    const totals = calculateTotals({
      lineItems: [{ quantity: 1, unitPriceCents: 1110 }],
      discountCents: 100,
      taxRatePercent: 5,
    });

    // 5% of $10.10 is 50.5¢.
    expect(totals.taxCents).toBe(51);
    expect(totals.totalCents).toBe(1061);
  });

  it("handles fractional tax rates such as 8.875%", () => {
    const totals = calculateTotals({
      lineItems: [{ quantity: 3, unitPriceCents: 1999 }],
      discountCents: 0,
      taxRatePercent: 8.875,
    });

    // 8.875% of $59.97 is 532.23…¢.
    expect(totals.taxCents).toBe(532);
    expect(totals.totalCents).toBe(6529);
  });

  it("caps the discount at the subtotal", () => {
    const totals = calculateTotals({
      lineItems: [{ quantity: 1, unitPriceCents: 1000 }],
      discountCents: 5000,
      taxRatePercent: 10,
    });

    expect(totals.discountCents).toBe(1000);
    expect(totals.totalCents).toBe(0);
  });

  it("returns zeros for an invoice without line items", () => {
    const totals = calculateTotals({ lineItems: [], discountCents: 0, taxRatePercent: 10 });

    expect(totals.totalCents).toBe(0);
  });
});

describe("lineTotalCents", () => {
  it("rounds half a cent up", () => {
    expect(lineTotalCents(1.5, 33)).toBe(50);
  });

  it("avoids floating point drift", () => {
    // 1.005 × 100 is 100.49999… in floating point; exact maths gives 100.5¢ → 101¢.
    expect(lineTotalCents(1.005, 100)).toBe(101);
  });

  it("stays exact beyond Number.MAX_SAFE_INTEGER intermediate products", () => {
    expect(lineTotalCents(99_999.999, 99_999_999)).toBe(9_999_999_800_000);
  });
});
