const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const moneyInput = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const longDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats integer cents as US dollars: 9900 → "$99.00". */
export function formatCents(cents: number): string {
  return currency.format(cents / 100);
}

/** Formats cents for an editable field without the currency sign: 125000 → "1,250.00". */
export function formatCentsForInput(cents: number): string {
  return Number.isFinite(cents) ? moneyInput.format(cents / 100) : "";
}

/** Formats quantities and rates without trailing zeros: 1.5 → "1.5". */
export function formatDecimal(value: number): string {
  return Number.isFinite(value) ? decimal.format(value) : "";
}

/** Formats a YYYY-MM-DD date without timezone drift: "2026-10-20" → "Oct 20, 2026". */
export function formatIsoDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "" : longDate.format(date);
}
