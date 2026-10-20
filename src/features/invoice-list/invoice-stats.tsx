import type { InvoiceSummaryDto } from "@/shared/dto/invoice.dto";
import { formatCents } from "@/shared/format";

const sumCents = (invoices: InvoiceSummaryDto[]) =>
  invoices.reduce((total, invoice) => total + invoice.totalCents, 0);
const countLabel = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

export function InvoiceStats({ invoices }: { invoices: InvoiceSummaryDto[] }) {
  const drafts = invoices.filter((invoice) => invoice.status === "draft");
  const sent = invoices.filter((invoice) => invoice.status === "sent");
  const stats = [
    {
      label: "All invoices",
      amount: sumCents(invoices),
      detail: countLabel(invoices.length, "invoice"),
    },
    { label: "Drafts", amount: sumCents(drafts), detail: countLabel(drafts.length, "draft") },
    {
      label: "Sent",
      amount: sumCents(sent),
      detail: `${countLabel(sent.length, "invoice")} emailed`,
    },
  ];

  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="min-w-0 rounded-2xl bg-surface px-3 py-3 shadow-panel sm:px-5 sm:py-4"
        >
          <dt className="text-xs text-ink-muted sm:text-sm">{stat.label}</dt>
          <dd className="mt-1 truncate font-display text-lg font-medium tabular-nums sm:text-[1.75rem]">
            {formatCents(stat.amount)}
          </dd>
          <dd className="text-xs text-ink-muted">{stat.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
