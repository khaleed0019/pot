import { Skeleton } from './Skeleton';

/** Mirrors DealCard.tsx: property title line, status pill + amount row, subtitle line. */
export function DealCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
      <Skeleton className="h-3 w-1/3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-7 w-28" />
      </div>
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function DealCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}
