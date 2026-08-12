'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getApiBaseUrl } from '@/lib/config';

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'AGENT' | 'ADMIN';
  profileImage?: string | null;
};

type AuthContextValue = {
  currentUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signUp: (email: string, password: string, name: string, role?: 'USER' | 'AGENT') => Promise<AppUser>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  syncWithBackend: (role?: 'USER' | 'AGENT') => Promise<AppUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mirrors the Supabase identity into our own User table and returns the app-level
 * record (which carries the role). The backend verifies the access token against
 * Supabase's JWKS, so the role can never be set from the client.
 */
async function syncWithBackendApi(accessToken: string, role?: 'USER' | 'AGENT'): Promise<AppUser> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_API_URL is not configured');

  const res = await fetch(`${base}/auth/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(role ? { role } : {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to sync account with server');
  }
  return data.user as AppUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getAccessToken = useCallback(async () => {
    if (!isSupabaseConfigured()) return null;
    const { data } = await getSupabase().auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const syncWithBackend = useCallback(async (role?: 'USER' | 'AGENT') => {
    const token = await getAccessToken();
    if (!token) throw new Error('Not signed in');
    const synced = await syncWithBackendApi(token, role);
    setAppUser(synced);
    return synced;
  }, [getAccessToken]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    const applySession = async (session: Session | null) => {
      setCurrentUser(session?.user ?? null);
      if (session?.access_token) {
        try {
          setAppUser(await syncWithBackendApi(session.access_token));
        } catch (err) {
          console.error('Failed to sync account with backend', err);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Sign-in did not return a session');
    const synced = await syncWithBackendApi(data.session.access_token);
    setAppUser(synced);
    return synced;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, role: 'USER' | 'AGENT' = 'USER') => {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw new Error(error.message);
      if (!data.session) {
        // Happens when "Confirm email" is on — there is no token to sync yet.
        throw new Error('Check your inbox to confirm your email, then sign in.');
      }
      const synced = await syncWithBackendApi(data.session.access_token, role);
      setAppUser(synced);
      return synced;
    },
    []
  );

  /** Redirects to Google; the session is picked up by onAuthStateChange on return. */
  const signInWithGoogle = useCallback(async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setAppUser(null);
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      appUser,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      getAccessToken,
      syncWithBackend,
    }),
    [currentUser, appUser, loading, signIn, signUp, signInWithGoogle, signOut, getAccessToken, syncWithBackend]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
