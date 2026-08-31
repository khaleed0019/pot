import { Skeleton } from './Skeleton';

/**
 * Generic "card row" skeleton covering the shape shared by most admin/dashboard
 * lists in this app: a leading icon/avatar, a title+subtitle text block, and
 * trailing actions or a status pill. Configure per call site rather than
 * building a bespoke skeleton for every list.
 */
export function ListRowSkeleton({
  leading = 'icon',
  trailing = 'buttons',
}: {
  /** Shape of the leading element, or 'none' to omit it. */
  leading?: 'icon' | 'avatar' | 'none';
  /** Shape of the trailing element. */
  trailing?: 'buttons' | 'pill' | 'none';
}) {
  return (
    <div className="bg-white rounded-3xl p-6 flex items-center gap-5 border border-gray-100 shadow-sm">
      {leading !== 'none' && (
        <Skeleton className={leading === 'avatar' ? 'w-12 h-12 rounded-2xl shrink-0' : 'w-11 h-11 rounded-2xl shrink-0'} />
      )}
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      {trailing === 'buttons' && (
        <div className="hidden md:flex gap-2 shrink-0">
          <Skeleton className="h-9 w-24 rounded-2xl" />
          <Skeleton className="h-9 w-24 rounded-2xl" />
        </div>
      )}
      {trailing === 'pill' && <Skeleton className="h-6 w-20 rounded-full shrink-0" />}
    </div>
  );
}

export function ListRowSkeletonStack({
  count = 5,
  leading,
  trailing,
}: {
  count?: number;
  leading?: 'icon' | 'avatar' | 'none';
  trailing?: 'buttons' | 'pill' | 'none';
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} leading={leading} trailing={trailing} />
      ))}
    </div>
  );
}
