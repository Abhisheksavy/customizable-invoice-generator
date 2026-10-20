const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;

/** Parses user-typed numbers such as "1,250.50" or "$40"; returns NaN for anything else. */
export function parseDecimal(text: string): number {
  const normalized = text
    .trim()
    .replace(/^(-?)\$/, "$1")
    .replaceAll(",", "");
  return NUMBER_PATTERN.test(normalized) ? Number(normalized) : Number.NaN;
}

/** Counts significant digits after the decimal point ("1.50" → 1). */
export function decimalPlaces(text: string): number {
  const fraction = text.trim().split(".")[1] ?? "";
  return fraction.replace(/0+$/, "").length;
}

/** Converts typed dollars to cents; over 2 decimals keeps a fraction so validation can flag it. */
export function parseCents(text: string): number {
  const amount = parseDecimal(text);
  return decimalPlaces(text) > 2 ? amount * 100 : Math.round(amount * 100);
}

/** True when a number has no more than `places` decimal digits, ignoring float noise. */
export function hasAtMostDecimals(value: number, places: number): boolean {
  const scaled = value * 10 ** places;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6;
}
