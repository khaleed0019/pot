'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPageContent() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'AGENT'>('USER');
  // Separate so the email button doesn't report progress for a Google click.
  const [pending, setPending] = useState<'email' | 'google' | null>(null);
  const submitting = pending !== null;
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = (userRole: string) => {
    if (userRole === 'ADMIN') router.push('/admin');
    else if (userRole === 'AGENT') router.push('/agent/dashboard');
    else router.push('/buy');
  };

  const handleSignup = async () => {
    setPending('email');
    setError(null);
    try {
      const user = await signUp(email, password, name, role);
      redirectByRole(user.role);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Signup failed');
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
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-primary p-12 text-center text-white relative">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <h2 className="text-3xl font-extrabold mb-4 relative z-10">Join Property On Set</h2>
            <p className="text-blue-100 font-medium relative z-10">Start your real estate journey today.</p>
          </div>
          <div className="p-12 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Account type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'USER' | 'AGENT')}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none font-medium"
              >
                <option value="USER">Buyer / Renter</option>
                <option value="AGENT">Real Estate Agent</option>
              </select>
            </div>

            {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

            <button
              onClick={handleSignup}
              disabled={submitting}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/30 flex items-center justify-center"
            >
              <CheckCircle2 className="h-6 w-6 mr-2" />
              {pending === 'email' ? 'Creating account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full border-2 border-gray-100 py-4 rounded-2xl font-bold text-secondary hover:bg-gray-50 disabled:opacity-60"
            >
              {pending === 'google' ? 'Redirecting to Google...' : 'Sign up with Google'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
