import type { Metadata } from "next";

// Invoice pages hold client data, so search engines are told to skip them.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InvoicesLayout({ children }: LayoutProps<"/invoices">) {
  return children;
}
