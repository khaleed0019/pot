'use client';

import { usePathname } from 'next/navigation';

function missingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }
  if (!process.env.NEXT_PUBLIC_API_URL) missing.push('NEXT_PUBLIC_API_URL');
  return missing;
}

export default function EnvGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const missing = missingEnv();

  if (missing.length === 0) {
    return <>{children}</>;
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-900">
        <strong>Configuration required:</strong> set {missing.join(', ')} in{' '}
        <code className="font-mono">frontend/.env.local</code> (or Vercel env vars).
        {isAuthPage && ' Sign-in will not work until Supabase and the API URL are set.'}
      </div>
      {children}
    </>
  );
}
