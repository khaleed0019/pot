'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import RequireRole from '@/components/RequireRole';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Eye,
  FileText,
  Globe,
  MessageSquare,
  PlusCircle,
  RefreshCcw,
  TrendingUp,
} from 'lucide-react';

type Listing = {
  id: string;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  price?: number;
  currency?: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  type?: string;
  listingViews?: number;
  totalLeads?: number;
  lastSavedAt?: string;
  updatedAt?: string;
  rejectionReason?: string;
  adminNote?: string;
};

type Stats = {
  totalListings: number;
  published: number;
  pending: number;
  rejected: number;
  totalViews: number;
  totalLeads: number;
  approvalRate: number;
};

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'DRAFT', label: 'Drafts' },
  { id: 'PENDING', label: 'In review' },
  { id: 'PUBLISHED', label: 'Live' },
  { id: 'REJECTED', label: 'Needs changes' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

const STATUS_STYLES: Record<Listing['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-blue-50 text-blue-700',
  REJECTED: 'bg-red-50 text-red-700',
  PUBLISHED: 'bg-green-50 text-green-700',
};

/** Drafts and rejected listings are the ones the wizard can still edit. */
const isEditable = (s: Listing['status']) => s === 'DRAFT' || s === 'REJECTED' || s === 'PENDING';

function AgentDashboard() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<FilterId>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, mine] = await Promise.all([apiFetch('/listings/stats'), apiFetch('/listings/mine')]);
      setStats(s);
      setListings(Array.isArray(mine) ? mine : []);
    } catch (e: unknown) {
      console.error('Failed to load agent dashboard', e);
      setError('Could not load your dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (filter === 'ALL' ? listings : listings.filter((l) => l.status === filter)),
    [listings, filter]
  );

  const counts = useMemo(() => {
    const by = (s: Listing['status']) => listings.filter((l) => l.status === s).length;
    return {
      ALL: listings.length,
      DRAFT: by('DRAFT'),
      PENDING: by('PENDING'),
      PUBLISHED: by('PUBLISHED'),
      REJECTED: by('REJECTED'),
    } as Record<FilterId, number>;
  }, [listings]);

  const cards = [
    { label: 'Total listings', value: stats?.totalListings, icon: FileText },
    { label: 'Live', value: stats?.published, icon: Globe },
    { label: 'In review', value: stats?.pending, icon: Clock },
    { label: 'Views', value: stats?.totalViews, icon: Eye },
    { label: 'Leads', value: stats?.totalLeads, icon: MessageSquare },
    { label: 'Approval rate', value: stats ? `${stats.approvalRate}%` : undefined, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-secondary">Agent Dashboard</h1>
            <p className="text-gray-500 mt-2">
              {appUser?.name || appUser?.email} · Manage drafts, track performance, submit listings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl font-bold hover:bg-gray-50"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link
              href="/agent/listings/new"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              <PlusCircle className="h-5 w-5" />
              New listing
            </Link>
          </div>
        </div>

        {error && <p className="text-red-600 font-semibold mb-6">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <Icon className="h-6 w-6 text-primary mb-3" />
              <p className="text-2xl font-extrabold text-secondary">
                {loading || value === undefined ? '—' : typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-2xl font-bold text-sm transition-all ${
                filter === f.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {f.label} {!loading && <span className="opacity-60">({counts[f.id] ?? 0})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500 font-bold">Loading your listings...</p>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold mb-6">
              {listings.length === 0
                ? 'No listings yet. Create your first one to get started.'
                : 'Nothing in this view.'}
            </p>
            {listings.length === 0 && (
              <Link
                href="/agent/listings/new"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold"
              >
                <PlusCircle className="h-5 w-5" /> New listing
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-extrabold text-secondary truncate">
                        {l.title || 'Untitled listing'}
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${STATUS_STYLES[l.status]}`}
                      >
                        {l.status === 'REJECTED' ? 'Needs changes' : l.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {[l.address, l.city, l.state].filter(Boolean).join(', ') || 'No address yet'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <span>
                        {l.price != null ? `$${l.price.toLocaleString()}` : 'No price'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {(l.listingViews ?? 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {(l.totalLeads ?? 0).toLocaleString()} leads
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {l.status === 'PUBLISHED' && (
                      <Link
                        href={`/property/${l.id}`}
                        className="bg-gray-50 text-secondary px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-100"
                      >
                        View live
                      </Link>
                    )}
                    {isEditable(l.status) && (
                      <Link
                        href={`/agent/listings/new?draftId=${l.id}`}
                        className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary/20"
                      >
                        {l.status === 'DRAFT' ? 'Continue editing' : 'Edit'}
                      </Link>
                    )}
                  </div>
                </div>

                {l.status === 'REJECTED' && (l.rejectionReason || l.adminNote) && (
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-red-700">Admin feedback</p>
                      <p className="text-red-600">{l.rejectionReason || l.adminNote}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentDashboardPage() {
  return (
    <RequireRole roles={['AGENT', 'ADMIN']}>
      <AgentDashboard />
    </RequireRole>
  );
}
