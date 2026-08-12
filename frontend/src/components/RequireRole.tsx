'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useAuth, type AppUser } from '@/contexts/AuthContext';

/**
 * Client-side gate for role-restricted pages.
 *
 * This is a UX guard only — it stops the wrong people seeing a broken shell.
 * The real enforcement is server-side: every /admin and /listings endpoint runs
 * requireAuth + requireAdmin/requireAgent, so a user who bypasses this simply
 * gets 401/403 from the API.
 */
export default function RequireRole({
  roles,
  children,
}: {
  roles: AppUser['role'][];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { appUser, loading } = useAuth();

  const allowed = appUser ? roles.includes(appUser.role) : false;

  useEffect(() => {
    if (loading) return;
    if (!appUser) router.replace('/login');
  }, [appUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        Checking your access...
      </div>
    );
  }

  if (!appUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        Redirecting to sign in...
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-12 text-center max-w-md">
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-secondary mb-3">Not authorized</h1>
          <p className="text-gray-500 mb-8">
            This area needs {roles.join(' or ')} access. You are signed in as{' '}
            <span className="font-bold">{appUser.role}</span>.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
