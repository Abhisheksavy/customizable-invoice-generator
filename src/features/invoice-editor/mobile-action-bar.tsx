"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { formatCents } from "@/shared/format";
import { calculateTotals } from "@/shared/invoice/calculate-totals";
import { toPreviewTotalsInput } from "./invoice-form-values";

/** Phone-only bar that keeps the running total and the save button in reach. */
export function MobileActionBar({ isSaving, onSave }: { isSaving: boolean; onSave: () => void }) {
  const [lineItems, discountCents, taxRatePercent] = useWatch<
    InvoiceInput,
    ["lineItems", "discountCents", "taxRatePercent"]
  >({
    name: ["lineItems", "discountCents", "taxRatePercent"],
  });
  const { totalCents } = calculateTotals(
    toPreviewTotalsInput({ lineItems, discountCents, taxRatePercent }),
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden print:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4">
        <div>
          <p className="text-xs text-ink-muted">Total due</p>
          <p className="text-lg font-semibold tabular-nums">{formatCents(totalCents)}</p>
        </div>
        <Button size="lg" onClick={onSave} disabled={isSaving} className="min-w-36">
          {isSaving ? <LoaderCircle aria-hidden className="animate-spin" /> : <Check aria-hidden />}
          {isSaving ? "Saving…" : "Save invoice"}
        </Button>
      </div>
    </div>
  );
}
