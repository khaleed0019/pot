/**
 * Base pulsing placeholder block. Compose with className to match whatever
 * shape (text line, image block, circle, pill) the real content will take —
 * the goal is every skeleton silhouettes its real layout, not a generic spinner.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-2xl ${className}`} />;
}

/** A single line of placeholder text. Width varies by content — pass e.g. "w-2/3". */
export function SkeletonLine({ className = 'w-full' }: { className?: string }) {
  return <Skeleton className={`h-4 rounded-lg ${className}`} />;
}

export function SkeletonCircle({ className = 'w-10 h-10' }: { className?: string }) {
  return <Skeleton className={`rounded-full ${className}`} />;
}
