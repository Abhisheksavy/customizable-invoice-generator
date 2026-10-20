"use client";

import { useWatch } from "react-hook-form";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { formatCents, formatDecimal } from "@/shared/format";
import { calculateTotals } from "@/shared/invoice/calculate-totals";
import { DecimalField } from "../form-fields";
import { toPreviewTotalsInput } from "../invoice-form-values";
import { SectionCard } from "../section-card";

export function AdjustmentsSection() {
  const [discountCents, taxRatePercent] = useWatch<
    InvoiceInput,
    ["discountCents", "taxRatePercent"]
  >({ name: ["discountCents", "taxRatePercent"] });
  const amounts = toPreviewTotalsInput({ discountCents, taxRatePercent });
  const summary = [
    amounts.discountCents > 0 ? `${formatCents(amounts.discountCents)} off` : "No discount",
    amounts.taxRatePercent > 0 ? `${formatDecimal(amounts.taxRatePercent)}% tax` : "no tax",
  ].join(" · ");

  return (
    <SectionCard
      title="Discount & tax"
      description="The discount comes off the subtotal, then tax is charged on what's left."
      summary={summary}
      fields={["discountCents", "taxRatePercent"]}
    >
      <div className="grid gap-4 @lg:grid-cols-2">
        <DecimalField
          name="discountCents"
          label="Discount"
          hint="A fixed amount, up to the subtotal."
          kind="money"
          leading="$"
          emptyValue={0}
        />
        <DecimalField
          name="taxRatePercent"
          label="Tax rate"
          hint="Between 0 and 100, e.g. 8.875."
          kind="decimal"
          trailing="%"
          emptyValue={0}
        />
      </div>
      <TotalsSummary />
    </SectionCard>
  );
}

function TotalsSummary() {
  const [lineItems, discountCents, taxRatePercent] = useWatch<
    InvoiceInput,
    ["lineItems", "discountCents", "taxRatePercent"]
  >({
    name: ["lineItems", "discountCents", "taxRatePercent"],
  });
  const input = toPreviewTotalsInput({ lineItems, discountCents, taxRatePercent });
  const totals = calculateTotals(input);

  return (
    <dl className="mt-5 rounded-xl bg-field p-4 text-sm">
      <SummaryRow label="Subtotal" value={formatCents(totals.subtotalCents)} />
      <SummaryRow label="Discount" value={`−${formatCents(totals.discountCents)}`} />
      <SummaryRow
        label={`Tax (${formatDecimal(input.taxRatePercent)}%)`}
        value={formatCents(totals.taxCents)}
      />
      <div className="mt-2 flex justify-between gap-4 border-t border-line pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatCents(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
