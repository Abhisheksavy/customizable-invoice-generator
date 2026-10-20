import {
  ArrowRight,
  Calculator,
  Check,
  Send,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui/button";
import { InvoiceSheet } from "@/features/invoice-sheet/invoice-sheet";
import { toInvoiceDocument } from "@/shared/invoice/invoice-document";
import { sampleInvoices } from "@/shared/invoice/sample-invoices";

const SAMPLE_DATE = "2026-10-20";
const HIGHLIGHTS = ["Live preview", "Print-ready PDF", "Email in one click"];

export default function HomePage() {
  const [sample] = sampleInvoices(SAMPLE_DATE);

  return (
    <>
      <SiteHeader>
        <Link href="/invoices" className={buttonStyles({ variant: "ghost", size: "sm" })}>
          Invoices
        </Link>
        <Link href="/invoices/new" className={buttonStyles({ size: "sm" })}>
          New invoice
        </Link>
      </SiteHeader>

      <main id="main">
        <section className="mx-auto grid max-w-6xl items-center gap-14 overflow-x-clip px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14 lg:pt-20 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft shadow-card">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              Invoicing for small businesses
            </p>
            <h1 className="mt-6 font-display text-[2.6rem] leading-[1.08] text-balance sm:text-5xl lg:text-[3.5rem]">
              Invoices that look as considered as <em className="text-brand">your work.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-soft">
              Fill in the details on one side and watch a polished invoice come together on the
              other. Totals are exact to the cent, private fields stay private, and sending takes
              one click.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/invoices/new" className={buttonStyles({ size: "lg" })}>
                Create an invoice
                <ArrowRight aria-hidden />
              </Link>
              <Link href="/invoices" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                View saved invoices
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
              {HIGHLIGHTS.map((highlight) => (
                <li key={highlight} className="flex items-center gap-1.5">
                  <Check aria-hidden className="size-4 text-success" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[3px] bg-white/60 shadow-sheet" />
            <InvoiceSheet
              invoice={toInvoiceDocument({ ...sample, notes: "" })}
              className="relative rounded-[3px] shadow-sheet"
            />
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="border-t border-line/70 bg-surface/60"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <h2
              id="features-heading"
              className="max-w-2xl font-display text-[2rem] leading-tight text-balance sm:text-[2.6rem]"
            >
              Built for getting paid, not for fiddling with templates.
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <Feature icon={Calculator} title="Exact to the cent">
                Each line is rounded to the cent, the discount comes off, then tax is added. The
                browser and the server run the same calculation, so the total you see is the total
                you send.
              </Feature>
              <Feature icon={SlidersHorizontal} title="Fields that fit your clients">
                Add a PO number, a project code or anything else your client asks for. Hide a field
                and it stays off the invoice, the PDF and the email.
              </Feature>
              <Feature icon={Send} title="Print it or send it">
                A clean print layout for Save as PDF, or email the invoice from the app with replies
                going straight to you.
              </Feature>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-ink-muted sm:px-6">
          <Logo />
          <p>A demo invoicing app. Every business, client and number shown is fictional.</p>
        </div>
      </footer>
    </>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface text-brand shadow-card">
        <Icon aria-hidden className="size-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
