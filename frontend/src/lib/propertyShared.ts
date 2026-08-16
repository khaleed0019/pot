/**
 * Property types + pure helpers usable from both server and client code.
 * Deliberately has no 'use client' directive — useProperties.ts (which does)
 * re-exports these for existing client call sites, but server components
 * (e.g. property/[id]/page.tsx's generateMetadata) must import from here
 * directly: a plain function re-exported from a 'use client' file is still
 * treated as a client-only binding and can't be called on the server.
 */

export type ListingType = 'SALE' | 'RENT' | 'SHORTLET' | 'INVESTMENT';

export type Property = {
  id: string;
  title: string;
  price?: number;
  currency?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  propertyType?: string;
  images?: string | string[];
  type: ListingType;
  lat?: number;
  lng?: number;
  investmentData?: { roi?: number; rentalYield?: number; marketTrend?: string };
};

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=2070';

/** The API returns `images` as either a JSON string or an array depending on route. */
export function firstImage(images: Property['images']): string {
  const list = Array.isArray(images)
    ? images
    : (() => {
        try {
          const parsed = JSON.parse(images || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();
  return list[0] || FALLBACK_IMAGE;
}
