"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonStyles } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl leading-none text-ink-muted/60">Oops.</p>
        <h1 className="mt-6 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-ink-muted">
          We couldn&apos;t load this page. Please try again in a moment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={retry}>Try again</Button>
          <Link href="/invoices" className={buttonStyles({ variant: "secondary" })}>
            View invoices
          </Link>
        </div>
      </div>
    </main>
  );
}
