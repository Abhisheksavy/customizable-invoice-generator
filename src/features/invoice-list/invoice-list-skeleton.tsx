import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceListSkeleton() {
  return (
    <div role="status" aria-label="Loading invoices" className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-[6.5rem] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
