import { Skeleton, SkeletonLine } from './Skeleton';

/** Mirrors InvestPageContent.tsx's investment card: image+ROI badge, location, title, yield/growth tiles, price row. */
export default function InvestmentCardSkeleton() {
  return (
    <div className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-gray-100 flex flex-col h-full">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-8 flex-1 flex flex-col">
        <SkeletonLine className="w-1/3 h-3 mb-4" />
        <SkeletonLine className="w-4/5 h-7 mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
        <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function InvestmentCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <InvestmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
