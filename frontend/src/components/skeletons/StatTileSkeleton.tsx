import { Skeleton } from './Skeleton';

/** Matches the "icon + big number + label" stat tiles used on admin/agent overview pages. */
export function StatTileSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
      <Skeleton className="w-10 h-10 rounded-2xl" />
      <Skeleton className="h-7 w-14" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  );
}

export function StatTileSkeletonRow({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <StatTileSkeleton key={i} />
      ))}
    </div>
  );
}
