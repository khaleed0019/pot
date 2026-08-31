import { Skeleton, SkeletonLine } from './Skeleton';

/** Mirrors PropertyCard.tsx's layout: image, price/rating row, title, location, stats row. */
export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-6 w-14 rounded-lg" />
        </div>
        <SkeletonLine className="w-3/4 h-6 mb-3" />
        <SkeletonLine className="w-1/2 mb-6" />
        <div className="flex justify-between items-center border-t border-gray-100 pt-6">
          <div className="flex space-x-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-center space-y-1.5">
                <Skeleton className="h-4 w-6 mx-auto" />
                <Skeleton className="h-2.5 w-8 mx-auto" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Grid of PropertyCardSkeletons — drop-in replacement for a loading properties grid. */
export function PropertyCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
