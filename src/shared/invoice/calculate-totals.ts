export interface TotalsInput {
  lineItems: ReadonlyArray<{ quantity: number; unitPriceCents: number }>;
  discountCents: number;
  taxRatePercent: number;
}

export interface InvoiceTotals {
  lineTotalsCents: number[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}

/** Computes totals in integer cents: round each line, sum, subtract the discount, then round the tax. */
export function calculateTotals({
  lineItems,
  discountCents,
  taxRatePercent,
}: TotalsInput): InvoiceTotals {
  const lineTotalsCents = lineItems.map((item) =>
    lineTotalCents(item.quantity, item.unitPriceCents),
  );
  const subtotalCents = sumCents(lineTotalsCents);
  // Capped so a preview of invalid input stays coherent; validation rejects it before saving.
  const appliedDiscountCents = Math.min(discountCents, subtotalCents);
  const taxableCents = subtotalCents - appliedDiscountCents;
  const taxCents = percentOfCents(taxableCents, taxRatePercent);

  return {
    lineTotalsCents,
    subtotalCents,
    discountCents: appliedDiscountCents,
    taxCents,
    totalCents: taxableCents + taxCents,
  };
}

/** Sums the rounded line totals before any discount or tax. */
export function calculateSubtotalCents(lineItems: TotalsInput["lineItems"]): number {
  return sumCents(lineItems.map((item) => lineTotalCents(item.quantity, item.unitPriceCents)));
}

/** Multiplies a quantity by a unit price and rounds half-up to whole cents. */
export function lineTotalCents(quantity: number, unitPriceCents: number): number {
  return divideRoundHalfUp(toThousandths(quantity) * BigInt(Math.round(unitPriceCents)), 1_000n);
}

function sumCents(values: number[]): number {
  return values.reduce((sum, cents) => sum + cents, 0);
}

/** Applies a percentage to an amount in cents and rounds half-up to whole cents. */
function percentOfCents(cents: number, ratePercent: number): number {
  return divideRoundHalfUp(BigInt(cents) * toThousandths(ratePercent), 100_000n);
}

/** Scales a value with up to 3 decimals to an exact integer number of thousandths. */
function toThousandths(value: number): bigint {
  return BigInt(Math.round(value * 1_000));
}

/** Divides non-negative integers, rounding halves up. */
function divideRoundHalfUp(numerator: bigint, denominator: bigint): number {
  return Number((numerator * 2n + denominator) / (denominator * 2n));
}
