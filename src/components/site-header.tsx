import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./brand/logo";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="rounded-lg" aria-label="Inkwell home">
          <Logo />
        </Link>
        {children && (
          <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
            {children}
          </nav>
        )}
      </div>
    </header>
  );
}
