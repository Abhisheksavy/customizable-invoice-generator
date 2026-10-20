import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface px-6 py-16 text-center shadow-panel">
      <StackedSheets />
      <h2 className="mt-6 font-display text-[1.75rem] leading-tight">No invoices yet</h2>
      <p className="mt-2 max-w-sm text-ink-muted">
        Create your first invoice. The preview builds itself as you type, and it&apos;s saved here
        once you&apos;re done.
      </p>
      <Link href="/invoices/new" className={buttonStyles({ className: "mt-6" })}>
        <Plus aria-hidden />
        Create an invoice
      </Link>
    </div>
  );
}

function StackedSheets() {
  return (
    <svg viewBox="0 0 120 96" aria-hidden className="w-28">
      <rect
        x="30"
        y="10"
        width="62"
        height="80"
        rx="3"
        fill="#e9e3d7"
        transform="rotate(6 61 50)"
      />
      <rect x="26" y="8" width="62" height="80" rx="3" fill="#fff" stroke="#cfc7b8" />
      <rect x="26" y="8" width="62" height="4" rx="1" fill="#2e4bdb" />
      <rect x="34" y="22" width="22" height="4" rx="2" fill="#1a1915" />
      <rect x="34" y="32" width="38" height="3" rx="1.5" fill="#e4ded3" />
      <rect x="34" y="40" width="46" height="3" rx="1.5" fill="#e4ded3" />
      <rect x="34" y="48" width="30" height="3" rx="1.5" fill="#e4ded3" />
      <rect x="56" y="66" width="24" height="12" rx="3" fill="#eef1fc" />
    </svg>
  );
}
