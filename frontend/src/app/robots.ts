import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Account/admin/agent areas require auth anyway, and dynamic API
        // routes have nothing worth indexing — keep crawlers off both.
        disallow: ['/admin', '/agent', '/dashboard', '/api'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
