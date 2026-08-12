'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Tracked separately so the email button doesn't show "Signing in..." when the
  // Google button was the one clicked.
  const [pending, setPending] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitting = pending !== null;

  const redirectByRole = (role: string) => {
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'AGENT') router.push('/agent/dashboard');
    else router.push('/buy');
  };

  const handleLogin = async () => {
    setPending('email');
    setError(null);
    try {
      const user = await signIn(email, password);
      redirectByRole(user.role);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    setPending('google');
    setError(null);
    try {
      // Redirects out to Google; /auth/callback finishes the sign-in and routes by role.
      await signInWithGoogle();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
      setPending(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row h-full md:h-[600px]">
          <div className="bg-secondary p-12 text-center text-white relative w-full md:w-1/3 flex flex-col items-center justify-center">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 mb-8 p-4 bg-white/10 backdrop-blur-md rounded-3xl">
              <ArrowRight className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold mb-4 relative z-10">Welcome Back</h2>
            <p className="text-gray-400 font-medium relative z-10 text-sm">Log in to manage your real estate assets.</p>
          </div>
          <div className="p-12 space-y-8 flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <Link href="/forgot" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={submitting || authLoading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/30 flex items-center justify-center"
            >
              <CheckCircle2 className="h-6 w-6 mr-2" />
              {pending === 'email' ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full border-2 border-gray-100 py-4 rounded-2xl font-bold text-secondary hover:bg-gray-50 disabled:opacity-60"
            >
              {pending === 'google' ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
