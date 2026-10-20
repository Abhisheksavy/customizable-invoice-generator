"use client";

import { useState } from "react";
import { formatCentsForInput, formatDecimal } from "@/shared/format";
import { hasAtMostDecimals, parseCents, parseDecimal } from "@/shared/numbers";
import { Input, type InputProps } from "./input";

const KINDS = {
  money: { parse: parseCents, format: formatCentsForInput, isTidy: Number.isInteger },
  decimal: {
    parse: parseDecimal,
    format: formatDecimal,
    isTidy: (value: number) => hasAtMostDecimals(value, 3),
  },
};

interface Draft {
  text: string;
  value: number;
}

export interface DecimalInputProps extends Omit<
  InputProps,
  "value" | "onChange" | "type" | "defaultValue"
> {
  value: number;
  onValueChange: (value: number) => void;
  kind: keyof typeof KINDS;
  emptyValue?: number;
}

/** Keeps the text as typed while reporting a parsed number (cents for money, NaN when invalid). */
export function DecimalInput({
  value,
  onValueChange,
  kind,
  emptyValue = Number.NaN,
  onBlur,
  ...props
}: DecimalInputProps) {
  const { parse, format, isTidy } = KINDS[kind];
  const [draft, setDraft] = useState<Draft | null>(null);
  const text = draft && Object.is(draft.value, value) ? draft.text : format(value);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={text}
      onChange={(event) => {
        const nextText = event.target.value;
        const nextValue = nextText.trim() === "" ? emptyValue : parse(nextText);
        setDraft({ text: nextText, value: nextValue });
        onValueChange(nextValue);
      }}
      onBlur={(event) => {
        if (Number.isFinite(value) && isTidy(value)) setDraft(null);
        onBlur?.(event);
      }}
    />
  );
}
