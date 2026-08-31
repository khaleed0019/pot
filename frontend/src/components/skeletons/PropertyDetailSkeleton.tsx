import { Skeleton, SkeletonLine } from './Skeleton';

/** Mirrors PropertyDetailContent.tsx's layout: hero image, stats row, description/amenities/map column, sidebar card. */
export default function PropertyDetailSkeleton() {
  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero */}
      <section className="relative h-[500px] md:h-[700px] bg-gray-100 overflow-hidden animate-pulse">
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="h-9 w-28 bg-gray-300/70 rounded-2xl" />
          <div className="h-12 w-2/3 max-w-xl bg-gray-300/70 rounded-2xl" />
          <div className="h-5 w-1/3 bg-gray-300/70 rounded-lg" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Skeleton className="h-4 w-64 mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-16">
            <div className="flex flex-wrap gap-8 py-10 border-b border-gray-100">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 flex-1 min-w-[150px]"
                >
                  <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <Skeleton className="h-8 w-56" />
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine className="w-2/3" />
            </div>

            <div className="space-y-6">
              <Skeleton className="h-8 w-40" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-3xl" />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-[400px] rounded-[40px]" />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-36" />
                </div>
                <Skeleton className="h-8 w-16 rounded-2xl" />
              </div>
              <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
