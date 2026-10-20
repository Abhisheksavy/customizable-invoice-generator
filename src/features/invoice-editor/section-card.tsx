import { useId, type ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6"
    >
      <div className="mb-5">
        <h2 id={headingId} className="text-[15px] font-semibold">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
