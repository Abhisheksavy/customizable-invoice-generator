import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatCents, formatDecimal, formatIsoDate } from "@/shared/format";
import type { InvoiceDocument } from "@/shared/invoice/invoice-document";

interface InvoiceSheetProps {
  invoice: InvoiceDocument;
  showPlaceholders?: boolean;
  className?: string;
}

/** The invoice as the client sees it: the live preview, the printed PDF and the landing-page demo. */
export function InvoiceSheet({ invoice, showPlaceholders = false, className }: InvoiceSheetProps) {
  const { business, customer, totals, accent } = invoice;
  const orPlaceholder = (value: string, placeholder: string) =>
    value.trim() || (showPlaceholders ? <Placeholder>{placeholder}</Placeholder> : null);

  return (
    <article
      aria-label={`Invoice ${invoice.invoiceNumber}`}
      style={{ "--accent": accent.hex, "--accent-tint": accent.tint } as CSSProperties}
      className={cn(
        "@container flex flex-col bg-white text-ink [-webkit-print-color-adjust:exact] [print-color-adjust:exact]",
        className,
      )}
    >
      <div aria-hidden className="h-1.5 shrink-0 bg-(--accent)" />

      <div className="flex flex-1 flex-col gap-7 px-5 py-7 text-[13px] leading-relaxed @md:px-8 @lg:gap-9 @lg:px-9 @lg:py-10 @lg:text-sm @2xl:px-11">
        <header className="flex flex-col-reverse gap-6 @lg:flex-row @lg:items-start @lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {business.name.trim() && <Monogram name={business.name} />}
            <div className="min-w-0">
              <p className="text-[15px] leading-snug font-semibold">
                {orPlaceholder(business.name, "Your business")}
              </p>
              {business.address.trim() && (
                <p className="whitespace-pre-line text-ink-muted">{business.address}</p>
              )}
              {business.email.trim() && (
                <p className="wrap-anywhere text-ink-muted">{business.email}</p>
              )}
            </div>
          </div>
          <div className="shrink-0 @lg:text-right">
            <h2 className="font-display text-[2.4rem] leading-none @lg:text-[2.75rem]">Invoice</h2>
            <p className="mt-2 font-medium tracking-wide text-ink-muted tabular-nums">
              {orPlaceholder(invoice.invoiceNumber, "INV-0001")}
            </p>
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 @lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="col-span-2 @lg:col-span-1 @lg:row-span-3">
            <MetaLabel>Billed to</MetaLabel>
            <dd>
              <p className="font-semibold">{orPlaceholder(customer.name, "Client name")}</p>
              {customer.address.trim() && (
                <p className="whitespace-pre-line text-ink-muted">{customer.address}</p>
              )}
              {customer.email.trim() && (
                <p className="wrap-anywhere text-ink-muted">{customer.email}</p>
              )}
            </dd>
          </div>
          <Meta label="Issued">
            {orPlaceholder(formatIsoDate(invoice.issueDate), "Issue date")}
          </Meta>
          <Meta label="Due">{orPlaceholder(formatIsoDate(invoice.dueDate), "Due date")}</Meta>
          {invoice.customFields.map((field, index) => (
            <Meta key={index} label={field.label}>
              {field.value}
            </Meta>
          ))}
        </dl>

        <table className="w-full border-collapse">
          <caption className="sr-only">Line items</caption>
          <thead>
            <tr className="text-left text-[11px] tracking-[0.08em] text-ink-muted uppercase">
              <th scope="col" className="border-b-2 border-(--accent) pb-2 font-semibold">
                Description
              </th>
              <th
                scope="col"
                className="hidden border-b-2 border-(--accent) pb-2 pl-4 text-right font-semibold @lg:table-cell"
              >
                Qty
              </th>
              <th
                scope="col"
                className="hidden border-b-2 border-(--accent) pb-2 pl-4 text-right font-semibold @lg:table-cell"
              >
                Price
              </th>
              <th
                scope="col"
                className="border-b-2 border-(--accent) pb-2 pl-4 text-right font-semibold"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={index} className="break-inside-avoid border-b border-line align-top">
                <td className="py-3 pr-2">
                  <span className="block font-medium">
                    {orPlaceholder(item.description, "Line item")}
                  </span>
                  <span className="block text-ink-muted tabular-nums @lg:hidden">
                    {formatDecimal(item.quantity)} × {formatCents(item.unitPriceCents)}
                  </span>
                </td>
                <td className="hidden py-3 pl-4 text-right tabular-nums @lg:table-cell">
                  {formatDecimal(item.quantity)}
                </td>
                <td className="hidden py-3 pl-4 text-right whitespace-nowrap tabular-nums @lg:table-cell">
                  {formatCents(item.unitPriceCents)}
                </td>
                <td className="py-3 pl-4 text-right font-medium whitespace-nowrap tabular-nums">
                  {formatCents(item.lineTotalCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex break-inside-avoid justify-end">
          <dl className="w-full @lg:max-w-[19rem]">
            <TotalRow label="Subtotal" value={formatCents(totals.subtotalCents)} />
            {totals.discountCents > 0 && (
              <TotalRow label="Discount" value={`−${formatCents(totals.discountCents)}`} />
            )}
            {invoice.taxRatePercent > 0 && (
              <TotalRow
                label={`Tax (${formatDecimal(invoice.taxRatePercent)}%)`}
                value={formatCents(totals.taxCents)}
              />
            )}
            <div className="mt-3 flex items-baseline justify-between gap-4 rounded-xl bg-(--accent-tint) px-4 py-3.5">
              <dt className="font-semibold text-(--accent)">Total due</dt>
              <dd className="font-display text-[1.6rem] leading-none font-medium tabular-nums">
                {formatCents(totals.totalCents)}
              </dd>
            </div>
          </dl>
        </div>

        {invoice.notes.trim() && (
          <section className="break-inside-avoid">
            <h3 className="mb-1 text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              Notes
            </h3>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </section>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-4 text-[11px] text-ink-muted">
          <span>
            {business.name}
            {business.email.trim() && ` · ${business.email}`}
          </span>
          <span className="tabular-nums">
            {invoice.invoiceNumber}
            {formatIsoDate(invoice.dueDate) && ` · Due ${formatIsoDate(invoice.dueDate)}`}
          </span>
        </footer>
      </div>
    </article>
  );
}

function Monogram({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-lg bg-(--accent) font-display text-2xl leading-none text-white"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function MetaLabel({ children }: { children: ReactNode }) {
  return (
    <dt className="mb-0.5 text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
      {children}
    </dt>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <MetaLabel>{label}</MetaLabel>
      <dd className="font-medium break-words">{children}</dd>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return <span className="font-normal text-ink-muted/55 italic print:invisible">{children}</span>;
}
