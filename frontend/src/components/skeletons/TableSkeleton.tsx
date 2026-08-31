import { Skeleton } from './Skeleton';

/** Body rows for a data table — pass the real <thead> so column headers stay visible while rows load. */
export function TableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-gray-50">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="p-4">
              <Skeleton className="h-4 w-16" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
