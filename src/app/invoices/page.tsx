import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/features/invoice-list/empty-state";
import { InvoiceList } from "@/features/invoice-list/invoice-list";
import { InvoiceListSkeleton } from "@/features/invoice-list/invoice-list-skeleton";
import { InvoiceStats } from "@/features/invoice-list/invoice-stats";
import { loadInvoiceSummaries } from "@/server/page-data";

export const metadata: Metadata = { title: "Invoices" };

export default function InvoicesPage() {
  return (
    <>
      <SiteHeader>
        <Link href="/invoices/new" className={buttonStyles({ size: "sm" })}>
          <Plus aria-hidden />
          New invoice
        </Link>
      </SiteHeader>
      <main id="main" className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:pt-14">
        <div className="mb-8">
          <h1 className="font-display text-[2.75rem] leading-tight sm:text-[3.25rem]">Invoices</h1>
          <p className="mt-2 text-ink-muted">
            Everything you&apos;ve drafted and sent, newest first.
          </p>
        </div>
        <Suspense fallback={<InvoiceListSkeleton />}>
          <InvoiceListContent />
        </Suspense>
      </main>
    </>
  );
}

async function InvoiceListContent() {
  const invoices = await loadInvoiceSummaries();
  if (invoices.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-6">
      <InvoiceStats invoices={invoices} />
      <InvoiceList invoices={invoices} />
    </div>
  );
}
