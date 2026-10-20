const DEFAULT_FIRST_NUMBER = "INV-0001";

/** Suggests the next number by incrementing the last digits and keeping the format: "INV-0041" → "INV-0042". */
export function nextInvoiceNumber(previous?: string): string {
  if (!previous) return DEFAULT_FIRST_NUMBER;

  const match = /^(.*?)(\d+)(\D*)$/.exec(previous);
  if (!match) return `${previous}-2`;

  const [, prefix = "", digits = "", suffix = ""] = match;
  const incremented = (BigInt(digits) + 1n).toString().padStart(digits.length, "0");
  return `${prefix}${incremented}${suffix}`;
}
