import { Tag } from 'lucide-react';

/** "SAVE X%" ribbon — red/warm so it reads as a promo, distinct from the primary-blue chrome elsewhere. */
export default function DiscountBadge({ percent, className = '' }: { percent: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg shadow-red-600/20 whitespace-nowrap ${className}`}
    >
      <Tag className="h-3 w-3 fill-current" />
      SAVE {percent}%
    </span>
  );
}
