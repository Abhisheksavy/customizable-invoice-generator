import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

const title = "Inkwell — Invoices for small businesses";
const description =
  "Create polished invoices with a live preview, totals exact to the cent, custom fields, print-ready PDFs and one-click email.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s · Inkwell" },
  description,
  applicationName: "Inkwell",
  openGraph: { type: "website", siteName: "Inkwell", url: "/", title, description },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  themeColor: "#f3efe7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          position="bottom-right"
          mobileOffset={{ bottom: 96 }}
          toastOptions={{ className: "font-sans" }}
        />
      </body>
    </html>
  );
}
