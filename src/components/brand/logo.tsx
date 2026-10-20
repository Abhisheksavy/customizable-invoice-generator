import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" fill="#1a1915" />
      <path
        d="M16 6.5c3.3 4.3 6.5 8.4 6.5 12a6.5 6.5 0 0 1-13 0c0-3.6 3.2-7.7 6.5-12Z"
        fill="#fff"
      />
      <circle cx="13.6" cy="19.4" r="1.7" fill="#2e4bdb" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[1.5rem] leading-none font-medium">Inkwell</span>
    </span>
  );
}
