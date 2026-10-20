"use client";

import { useDeferredValue, useMemo } from "react";
import { useWatch } from "react-hook-form";
import { cn } from "@/lib/cn";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { toInvoiceDocument } from "@/shared/invoice/invoice-document";
import { InvoiceSheet } from "../invoice-sheet/invoice-sheet";
import { toPreviewInput } from "./invoice-form-values";

/** Sticky preview column on desktop; also the only thing that prints. */
export function PreviewPanel({ className }: { className?: string }) {
  return (
    <section
      aria-label="Invoice preview"
      className={cn(
        "min-w-0 lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:rounded-2xl lg:bg-canvas-deep/60 lg:p-6",
        "print:static print:!block print:max-h-none print:overflow-visible print:rounded-none print:bg-transparent print:p-0",
        className,
      )}
    >
      <div className="mb-3 hidden items-center justify-between gap-4 lg:flex print:hidden">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-ink-muted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-success" />
          Live preview
        </p>
        <p className="text-xs text-ink-muted">What your client will see</p>
      </div>
      <LivePreview />
    </section>
  );
}

function LivePreview() {
  const values = useWatch<InvoiceInput>();
  const deferredValues = useDeferredValue(values);
  const invoice = useMemo(
    () => toInvoiceDocument(toPreviewInput(deferredValues)),
    [deferredValues],
  );

  return (
    <InvoiceSheet
      invoice={invoice}
      showPlaceholders
      className="mx-auto aspect-[8.5/11] w-full max-w-[52rem] rounded-[3px] shadow-sheet print:aspect-auto print:max-w-none print:rounded-none print:shadow-none"
    />
  );
}
