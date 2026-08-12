'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckSquare,
  Clock,
  Eye,
  FileText,
  Globe,
  RefreshCcw,
  Users,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import RequireRole from '@/components/RequireRole';
import { useAuth } from '@/contexts/AuthContext';

type Counts = {
  pending: number;
  published: number;
  rejected: number;
  drafts: number;
  users: number;
  views: number;
};

const TABS = ['pending', 'published', 'rejected', 'drafts'] as const;

function AdminOverview() {
  const { appUser } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // One request per tab plus users — the admin API exposes counts only via lists.
      const [pending, published, rejected, drafts, users] = await Promise.all([
        ...TABS.map((t) => apiFetch(`/admin/properties?tab=${t}`)),
        apiFetch('/admin/users'),
      ]);
      setCounts({
        pending: pending.length,
        published: published.length,
        rejected: rejected.length,
        drafts: drafts.length,
        users: users.length,
        views: published.reduce(
          (sum: number, p: { listingViews?: number }) => sum + (p.listingViews ?? 0),
          0
        ),
      });
    } catch (e: unknown) {
      console.error('Failed to load admin overview', e);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = [
    { label: 'Awaiting review', value: counts?.pending, icon: Clock, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Published', value: counts?.published, icon: Globe, tone: 'text-green-600 bg-green-50' },
    { label: 'Rejected', value: counts?.rejected, icon: XCircle, tone: 'text-red-600 bg-red-50' },
    { label: 'Drafts', value: counts?.drafts, icon: FileText, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Total views', value: counts?.views, icon: Eye, tone: 'text-purple-600 bg-purple-50' },
    { label: 'Users', value: counts?.users, icon: Users, tone: 'text-gray-600 bg-gray-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-secondary">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">
              Signed in as {appUser?.name || appUser?.email} · Review listings, publish approved
              properties, and manage users.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl font-bold hover:bg-gray-50 self-start"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {error && <p className="text-red-500 font-semibold mb-6">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-extrabold text-secondary">
                {loading ? '—' : (value ?? 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>

        {!loading && counts?.pending ? (
          <Link
            href="/admin/properties"
            className="block bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-10 hover:bg-amber-100 transition-colors"
          >
            <p className="font-extrabold text-amber-900">
              {counts.pending} listing{counts.pending === 1 ? '' : 's'} waiting on your review
            </p>
            <p className="text-amber-800 text-sm mt-1">Open the Listing CMS to approve or reject &rarr;</p>
          </Link>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/properties"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <CheckSquare className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-secondary mb-2">Listing CMS</h2>
            <p className="text-gray-500 text-sm">
              Pending, approved, rejected, drafts, and published tabs with preview and actions.
            </p>
          </Link>
          <Link
            href="/admin/users"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <Users className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-secondary mb-2">Users &amp; Roles</h2>
            <p className="text-gray-500 text-sm">
              Promote agents, grant admin access, and review who has signed up.
            </p>
          </Link>
          <Link
            href="/admin/analytics"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <BarChart3 className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-xl font-bold text-secondary mb-2">Agent Analytics</h2>
            <p className="text-gray-500 text-sm">
              Approval rates, leads, views, and top performing agents.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <AdminOverview />
    </RequireRole>
  );
}
