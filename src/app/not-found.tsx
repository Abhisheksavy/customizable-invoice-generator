import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="font-display text-8xl leading-none text-ink-muted/60">404</p>
        <h1 className="mt-6 text-2xl font-semibold">We couldn&apos;t find that page</h1>
        <p className="mt-2 text-ink-muted">
          The invoice may have been deleted, or the link has a typo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/invoices" className={buttonStyles()}>
            View invoices
          </Link>
          <Link href="/" className={buttonStyles({ variant: "secondary" })}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
