"use client";

import { Check } from "lucide-react";
import { useController } from "react-hook-form";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { ACCENT_COLOR_KEYS, ACCENT_COLORS } from "@/shared/invoice/accent-colors";
import { SectionCard } from "../section-card";

export function StyleSection() {
  const { field } = useController<InvoiceInput, "accentColor">({ name: "accentColor" });

  return (
    <SectionCard title="Style" description="Accent color for the invoice, the PDF and the email.">
      <fieldset>
        <legend className="sr-only">Accent color</legend>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLOR_KEYS.map((key) => {
            const color = ACCENT_COLORS[key];
            const checked = field.value === key;
            return (
              <label key={key} className="cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={key}
                  checked={checked}
                  onChange={() => field.onChange(key)}
                  ref={checked ? field.ref : undefined}
                  className="peer sr-only"
                />
                <span className="flex h-9 items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pr-3.5 pl-1.5 text-sm text-ink-soft transition-colors peer-checked:border-ink peer-checked:text-ink peer-checked:shadow-[inset_0_0_0_1px_var(--color-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand hover:border-ink-muted">
                  <span
                    aria-hidden
                    className="grid size-6 place-items-center rounded-full text-white"
                    style={{ backgroundColor: color.hex }}
                  >
                    {checked && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  {color.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </SectionCard>
  );
}
