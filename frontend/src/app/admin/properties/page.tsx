'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  RefreshCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import RequireRole from '@/components/RequireRole';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'published', label: 'Published' },
] as const;

type TabId = (typeof TABS)[number]['id'];

type PropertyRow = {
  id: string;
  title: string;
  address: string;
  city?: string;
  country?: string;
  price: number;
  currency?: string;
  status: string;
  description?: string;
  amenities?: string[];
  images?: string[];
  adminNote?: string;
  rejectionReason?: string;
  history?: { action: string; note?: string; createdAt: string; user?: { name?: string } }[];
  owner?: { name?: string; email: string };
};

function AdminProperties() {
  const [tab, setTab] = useState<TabId>('pending');
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PropertyRow | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/admin/properties?tab=${tab}`);
      setProperties(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const openPreview = async (id: string) => {
    try {
      const p = await apiFetch(`/admin/properties/${id}`);
      setPreview(p);
      setAdminNote(p.adminNote || '');
      setRejectionReason(p.rejectionReason || '');
    } catch {
      alert('Could not load preview');
    }
  };

  const act = async (action: 'approve' | 'reject' | 'request-changes') => {
    if (!preview) return;
    setActing(true);
    try {
      if (action === 'approve') {
        await apiFetch(`/admin/properties/${preview.id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ adminNote }),
        });
      } else if (action === 'reject') {
        await apiFetch(`/admin/properties/${preview.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ rejectionReason, adminNote }),
        });
      } else {
        await apiFetch(`/admin/properties/${preview.id}/request-changes`, {
          method: 'POST',
          body: JSON.stringify({ adminNote }),
        });
      }
      setPreview(null);
      await load();
    } catch {
      alert('Action failed');
    } finally {
      setActing(false);
    }
  };

  const remove = async (p: PropertyRow) => {
    // Deletion is permanent and cascades nothing — confirm before firing.
    if (!window.confirm(`Permanently delete "${p.title || 'Untitled'}"? This cannot be undone.`)) {
      return;
    }
    try {
      await apiFetch(`/admin/properties/${p.id}`, { method: 'DELETE' });
      setPreview((cur) => (cur?.id === p.id ? null : cur));
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-primary font-bold mb-6">
          <ArrowLeft className="h-4 w-4" /> Admin home
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-secondary">Listing CMS</h1>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl font-bold hover:bg-gray-50"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-2xl font-bold text-sm transition-all ${
                tab === t.id ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {properties.length === 0 ? (
              <p className="text-gray-500">No listings in this tab.</p>
            ) : (
              properties.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-100 shadow-sm"
                >
                  <div>
                    <p className="font-extrabold text-secondary">{p.title || 'Untitled'}</p>
                    <p className="text-sm text-gray-500">
                      {p.address}
                      {p.city ? `, ${p.city}` : ''} · {p.currency || 'USD'} {p.price?.toLocaleString?.()}
                    </p>
                    <p className="text-xs font-bold mt-1 uppercase text-gray-400">Status: {p.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openPreview(p.id)}
                      className="flex items-center gap-1 bg-gray-50 text-secondary px-4 py-2 rounded-2xl text-sm font-bold hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </button>
                    {p.status === 'PENDING' && (
                      <>
                        <button
                          onClick={async () => {
                            await apiFetch(`/admin/properties/${p.id}/approve`, {
                              method: 'POST',
                              body: JSON.stringify({}),
                            });
                            load();
                          }}
                          className="flex items-center gap-1 bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-sm font-bold"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={async () => {
                            await apiFetch(`/admin/properties/${p.id}/reject`, {
                              method: 'POST',
                              body: JSON.stringify({ rejectionReason: 'Rejected' }),
                            });
                            load();
                          }}
                          className="flex items-center gap-1 bg-red-50 text-red-700 px-4 py-2 rounded-2xl text-sm font-bold"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => remove(p)}
                      className="flex items-center gap-1 bg-white border border-red-100 text-red-600 px-4 py-2 rounded-2xl text-sm font-bold hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-secondary mb-2">{preview.title}</h2>
            <p className="text-gray-500 text-sm mb-4">
              {preview.address} · {preview.status} · Agent: {preview.owner?.name || preview.owner?.email}
            </p>
            <p className="text-gray-600 mb-6">{preview.description}</p>
            {preview.images && preview.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto mb-6">
                {preview.images.slice(0, 5).map((url) => (
                  <img key={url} src={url} alt="" className="h-24 w-32 object-cover rounded-xl shrink-0" />
                ))}
              </div>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Admin note</label>
                <textarea
                  className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-none"
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
              {preview.status === 'PENDING' && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Rejection reason</label>
                  <input
                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-none"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="mb-6">
              <h3 className="font-bold text-secondary flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" /> History
              </h3>
              <ul className="text-sm space-y-2 max-h-32 overflow-y-auto">
                {(preview.history || []).map((h, i) => (
                  <li key={i} className="text-gray-500">
                    {h.action} {h.note ? `— ${h.note}` : ''} · {new Date(h.createdAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {preview.status === 'PENDING' && (
                <>
                  <button
                    disabled={acting}
                    onClick={() => act('approve')}
                    className="flex-1 min-w-[120px] bg-green-600 text-white py-3 rounded-2xl font-bold"
                  >
                    Approve & publish
                  </button>
                  <button
                    disabled={acting}
                    onClick={() => act('reject')}
                    className="flex-1 min-w-[120px] bg-red-600 text-white py-3 rounded-2xl font-bold"
                  >
                    Reject
                  </button>
                  <button
                    disabled={acting}
                    onClick={() => act('request-changes')}
                    className="flex-1 min-w-[120px] bg-amber-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" /> Request changes
                  </button>
                </>
              )}
              <button
                onClick={() => setPreview(null)}
                className="px-6 py-3 rounded-2xl font-bold border border-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPropertiesPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <AdminProperties />
    </RequireRole>
  );
}
