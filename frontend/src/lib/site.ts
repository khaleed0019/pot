/** Canonical site URL (no trailing slash), used by robots/sitemap/OG tags. */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://property-on-set.netlify.app').replace(/\/$/, '');
}
