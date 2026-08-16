import type { Metadata } from 'next';
import { getApiBaseUrl } from '@/lib/config';
import { firstImage } from '@/lib/propertyShared';
import { safeJsonLd } from '@/lib/jsonLd';
import PropertyDetailContent from '@/components/PropertyDetailContent';

type PropertyForMeta = {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  city?: string;
  state?: string;
  address?: string;
  images?: string | string[];
};

/** Best-effort server-side fetch just for metadata/schema — the client
 * component does its own fetch for the interactive page itself, so a
 * failure here only degrades the <title>/OG tags, not the page. */
async function fetchProperty(id: string): Promise<PropertyForMeta | null> {
  const base = getApiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/properties/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchProperty(id);

  if (!property) {
    return { title: 'Property Listing' };
  }

  const location = [property.city, property.state].filter(Boolean).join(', ');
  const price = property.price != null ? `$${property.price.toLocaleString()}` : '';
  const description =
    property.description?.slice(0, 155) ||
    `${property.title} in ${location}. ${price ? `Listed at ${price}.` : ''}`.trim();
  const image = firstImage(property.images);

  return {
    title: property.title || 'Property Listing',
    description,
    openGraph: {
      title: property.title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await fetchProperty(id);

  const jsonLd = property
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.title,
        description: property.description,
        url: undefined,
        image: firstImage(property.images) || undefined,
        offers: property.price != null
          ? {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: property.currency || 'USD',
            }
          : undefined,
        address: property.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: property.address,
              addressLocality: property.city,
              addressRegion: property.state,
              addressCountry: 'US',
            }
          : undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      )}
      <PropertyDetailContent />
    </>
  );
}
