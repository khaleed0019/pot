'use client';

import { useEffect, useState } from 'react';
import type { ListingType, Property } from './propertyShared';

// Re-exported for existing client call sites — see propertyShared.ts for why
// server components (generateMetadata etc.) must import these directly from
// there instead of from this 'use client' file.
export type { ListingType, Property } from './propertyShared';
export { FALLBACK_IMAGE, firstImage } from './propertyShared';

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
