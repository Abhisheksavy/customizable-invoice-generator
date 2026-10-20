import { describe, expect, it } from "vitest";
import { decimalPlaces, hasAtMostDecimals, parseCents, parseDecimal } from "./numbers";

describe("parseDecimal", () => {
  it.each([
    ["42", 42],
    ["1,250.50", 1250.5],
    ["$40", 40],
    [" .5 ", 0.5],
    ["-3", -3],
  ])("parses %j", (text, expected) => {
    expect(parseDecimal(text)).toBe(expected);
  });

  it.each(["", "abc", "1.2.3", "1e3", "--1"])("rejects %j", (text) => {
    expect(parseDecimal(text)).toBeNaN();
  });
});

describe("parseCents", () => {
  it("converts dollars to whole cents without float drift", () => {
    expect(parseCents("0.29")).toBe(29);
    expect(parseCents("12.30")).toBe(1230);
    expect(parseCents("1,000")).toBe(100000);
  });

  it("keeps a fraction when more than two decimals are typed", () => {
    expect(Number.isInteger(parseCents("12.345"))).toBe(false);
  });
});

describe("decimal helpers", () => {
  it("ignores trailing zeros when counting decimals", () => {
    expect(decimalPlaces("1.500")).toBe(1);
  });

  it("tolerates float noise", () => {
    expect(hasAtMostDecimals(0.1 + 0.2, 1)).toBe(true);
    expect(hasAtMostDecimals(1.2345, 3)).toBe(false);
  });
});
