import { Skeleton } from "@/components/ui/skeleton";

export function EditorSkeleton() {
  return (
    <div role="status" aria-label="Loading invoice">
      <div className="h-16 border-b border-line/80" />
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 pt-6 sm:px-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,40rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-60 rounded-2xl" />
          <Skeleton className="h-60 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <Skeleton className="hidden aspect-[8.5/11] rounded-2xl lg:block" />
      </div>
    </div>
  );
}
