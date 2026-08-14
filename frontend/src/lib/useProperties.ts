'use client';

import { useEffect, useState } from 'react';

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

/** Server-supported filters on GET /properties. */
export type PropertyFilters = {
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
  propertyType?: string;
};

/** Shared loader for published listings of a given type. */
export function useProperties(type: ListingType, filters: PropertyFilters = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize so the effect re-runs on value changes, not object identity.
  const query = new URLSearchParams({ type });
  (Object.keys(filters) as (keyof PropertyFilters)[]).forEach((key) => {
    const value = filters[key];
    if (value) query.append(key, value);
  });
  const queryString = query.toString();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { publicFetch } = await import('@/lib/api');
        const data = await publicFetch(`/properties?${queryString}`);
        if (!cancelled) setProperties(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        // Surface a generic message; the detail belongs in the console, not the UI.
        console.error(`Failed to load ${type} listings`, err);
        if (!cancelled) setError('Unable to load listings right now. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, queryString]);

  return { properties, loading, error };
}
