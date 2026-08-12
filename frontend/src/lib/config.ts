/** API base URL — must end with /api (no trailing slash after api). Set in Vercel env. */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url) {
    if (typeof window !== 'undefined') {
      console.warn('NEXT_PUBLIC_API_URL is not set');
    }
    return '';
  }
  return url.replace(/\/$/, '');
}
