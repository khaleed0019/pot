import { getApiBaseUrl } from './config';

export async function getAuthHeaders(extra?: HeadersInit): Promise<HeadersInit> {
  const headers: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
    if (isSupabaseConfigured()) {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return { ...headers, ...(extra as Record<string, string>) };
}

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const isFormData = options.body instanceof FormData;
  const authHeaders = await getAuthHeaders();
  const headers: HeadersInit = {
    ...authHeaders,
    ...(options.headers || {}),
  };
  if (!isFormData && !(headers as Record<string, string>)['Content-Type']) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json();
};

/** Public fetch (no auth) for published listings */
export const publicFetch = async (path: string, options: RequestInit = {}) => {
  const base = getApiBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_API_URL is not configured');

  const res = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, options);
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
};
