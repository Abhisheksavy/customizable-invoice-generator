"use client";

import { ChevronDown, CircleAlert } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { get, useFormState, type FieldPath } from "react-hook-form";
import { cn } from "@/lib/cn";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { countFieldErrors } from "./form-errors";

interface SectionCardProps {
  title: string;
  description: string;
  summary: ReactNode;
  fields: FieldPath<InvoiceInput>[];
  children: ReactNode;
}

/** Collapsible form section: closed by default, and kept open while any of its fields has an error. */
export function SectionCard({ title, description, summary, fields, children }: SectionCardProps) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const { errors } = useFormState<InvoiceInput>();
  const errorCount = fields.reduce(
    (count, field) => count + countFieldErrors(get(errors, field)),
    0,
  );
  const isOpen = expanded || errorCount > 0;

  return (
    <section className="rounded-2xl bg-surface shadow-panel">
      <h2>
        <button
          type="button"
          id={`${id}-toggle`}
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          onClick={() => setExpanded(!isOpen)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-4 text-left sm:px-6 sm:py-5"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">{title}</span>
            <span className={cn("mt-0.5 block text-sm text-ink-muted", !isOpen && "truncate")}>
              {isOpen ? description : summary}
            </span>
          </span>
          {errorCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-danger">
              <CircleAlert aria-hidden className="size-3.5" />
              {errorCount === 1 ? "1 to fix" : `${errorCount} to fix`}
            </span>
          )}
          <ChevronDown
            aria-hidden
            className={cn(
              "size-5 shrink-0 text-ink-muted transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </h2>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-toggle`}
        inert={!isOpen}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pt-1 pb-5 sm:px-6 sm:pb-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
