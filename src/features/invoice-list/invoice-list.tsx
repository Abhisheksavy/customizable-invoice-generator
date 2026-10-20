import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import type { InvoiceSummaryDto } from "@/shared/dto/invoice.dto";
import { formatCents, formatIsoDate } from "@/shared/format";

const DESKTOP_COLUMNS = "md:grid-cols-[7.5rem_minmax(0,1fr)_8rem_8rem_5.5rem_8rem_1rem]";

export function InvoiceList({ invoices }: { invoices: InvoiceSummaryDto[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div
        aria-hidden
        className={`hidden gap-4 border-b border-line bg-surface-muted px-5 py-3 text-xs font-semibold tracking-wide text-ink-muted uppercase md:grid ${DESKTOP_COLUMNS}`}
      >
        <span>Invoice</span>
        <span>Client</span>
        <span>Issued</span>
        <span>Due</span>
        <span>Status</span>
        <span className="text-right">Amount</span>
      </div>
      <ul className="divide-y divide-line">
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <InvoiceRow invoice={invoice} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: InvoiceSummaryDto }) {
  const total = formatCents(invoice.totalCents);
  const due = formatIsoDate(invoice.dueDate);
  const label = `${invoice.invoiceNumber}, ${invoice.customerName}, ${total}, due ${due}, ${invoice.status}`;

  return (
    <Link
      href={`/invoices/${invoice.id}`}
      aria-label={label}
      className="group block px-4 py-4 transition-colors hover:bg-surface-muted focus-visible:-outline-offset-2 sm:px-5"
    >
      <div className="flex items-start justify-between gap-4 md:hidden">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold tabular-nums">
            {invoice.invoiceNumber}
            <InvoiceStatusBadge status={invoice.status} />
          </p>
          <p className="mt-0.5 truncate text-ink-soft">{invoice.customerName}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums">{total}</p>
          <p className="mt-0.5 text-sm text-ink-muted">Due {due}</p>
        </div>
      </div>

      <div className={`hidden items-center gap-4 md:grid ${DESKTOP_COLUMNS}`}>
        <span className="font-semibold tabular-nums">{invoice.invoiceNumber}</span>
        <span className="truncate text-ink-soft">{invoice.customerName}</span>
        <span className="text-sm text-ink-muted tabular-nums">
          {formatIsoDate(invoice.issueDate)}
        </span>
        <span className="text-sm text-ink-muted tabular-nums">{due}</span>
        <span>
          <InvoiceStatusBadge status={invoice.status} />
        </span>
        <span className="text-right font-semibold tabular-nums">{total}</span>
        <ChevronRight
          aria-hidden
          className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
