import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getSiteUrl } from '@/lib/site';
import { safeJsonLd } from '@/lib/jsonLd';

export type Crumb = { label: string; href?: string };

/** Visible trail + matching BreadcrumbList JSON-LD for the same items. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href ? `${getSiteUrl()}${item.href}` : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <ol className="flex items-center flex-wrap gap-1 text-gray-500">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-primary font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="text-secondary font-bold truncate max-w-[220px]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
