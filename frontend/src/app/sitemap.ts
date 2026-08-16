import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';
import { getApiBaseUrl } from '@/lib/config';

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'daily' as const },
  { path: '/buy', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/rent', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/shortlet', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/invest', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/sell', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/agents', priority: 0.6, changeFrequency: 'weekly' as const },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/cookies', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/disclaimer', priority: 0.2, changeFrequency: 'yearly' as const },
];

/** Fetches published listing ids so each gets its own sitemap entry. */
async function fetchPropertyIds(): Promise<string[]> {
  const base = getApiBaseUrl();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/properties`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const properties: { id: string }[] = await res.json();
    return properties.map((p) => p.id);
  } catch {
    // A slow/cold backend shouldn't fail the whole sitemap — ship the static
    // routes and let listings catch up on the next revalidation.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${site}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const propertyIds = await fetchPropertyIds();
  const propertyEntries: MetadataRoute.Sitemap = propertyIds.map((id) => ({
    url: `${site}/property/${id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...propertyEntries];
}
