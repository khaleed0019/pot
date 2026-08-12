'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Landing page for the Google OAuth redirect. The Supabase client parses the
 * session out of the URL itself (detectSessionInUrl), so this only waits for
 * AuthContext to resolve the role, then routes the user to the right home.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { appUser, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase reports OAuth failures as URL fragment params.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const description = hash.get('error_description') || hash.get('error');
    if (description) setError(description);
  }, []);

  useEffect(() => {
    if (loading || error) return;
    if (!appUser) return;
    if (appUser.role === 'ADMIN') router.replace('/admin');
    else if (appUser.role === 'AGENT') router.replace('/agent/dashboard');
    else router.replace('/buy');
  }, [appUser, loading, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-12 text-center max-w-md w-full">
        {error ? (
          <>
            <h1 className="text-2xl font-extrabold text-secondary mb-3">Sign-in failed</h1>
            <p className="text-gray-500 mb-8">{error}</p>
            <button
              onClick={() => router.replace('/login')}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-extrabold text-secondary mb-2">Finishing sign-in...</h1>
            <p className="text-gray-500">One moment while we set up your account.</p>
          </>
        )}
      </div>
    </div>
  );
}
