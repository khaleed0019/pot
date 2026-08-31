'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bitcoin,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  QrCode,
  RefreshCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import RequireRole from '@/components/RequireRole';
import { Skeleton } from '@/components/skeletons/Skeleton';
import { ListRowSkeletonStack } from '@/components/skeletons/ListRowSkeleton';
import { NETWORK_LABELS, type CryptoNetwork } from '@/lib/crypto';

type AdminAddress = {
  id: string;
  network: CryptoNetwork;
  address: string;
  label: string | null;
  qrImage: string | null;
  active: boolean;
  createdAt: string;
};

type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

type AdminPayment = {
  id: string;
  network: CryptoNetwork;
  status: PaymentStatus;
  amountUsd: number | null;
  txHash: string | null;
  proofImage: string | null;
  note: string | null;
  reviewNote: string | null;
  createdAt: string;
  address: { network: CryptoNetwork; address: string; label: string | null };
  user: { id: string; name: string | null; email: string };
  property: { id: string; title: string; coverImage: string | null } | null;
  deal: { id: string; amount: number; currency: string } | null;
};

type AdminGuideImage = {
  id: string;
  network: CryptoNetwork | null;
  step: number;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
};

const NETWORKS: CryptoNetwork[] = ['BTC', 'ETH', 'SOL'];
const TABS = [
  { key: 'payments', label: 'Payment review' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'guide', label: 'How-to-buy guide' },
] as const;
type Tab = (typeof TABS)[number]['key'];

// ---- Addresses tab ----

function AddressesTab() {
  const [addresses, setAddresses] = useState<AdminAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<CryptoNetwork>('BTC');
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAddresses(await apiFetch('/admin/crypto/addresses'));
    } catch {
      setError('Could not load addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addAddress = async () => {
    if (!address.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await apiFetch('/admin/crypto/addresses', {
        method: 'POST',
        body: JSON.stringify({ network, address: address.trim(), label: label.trim() || undefined }),
      });
      setAddresses((prev) => [...prev, created]);
      setAddress('');
      setLabel('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not add address');
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (a: AdminAddress) => {
    setSavingId(a.id);
    try {
      const updated = await apiFetch(`/admin/crypto/addresses/${a.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !a.active }),
      });
      setAddresses((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not update address');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (a: AdminAddress) => {
    if (!window.confirm(`Remove this ${a.network} address?`)) return;
    setSavingId(a.id);
    try {
      await apiFetch(`/admin/crypto/addresses/${a.id}`, { method: 'DELETE' });
      await load(); // may have been deactivated instead of deleted if it has payment history
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not remove address');
    } finally {
      setSavingId(null);
    }
  };

  // A wallet's own QR can encode an amount or memo/tag a plain address URI
  // can't, so admin can attach the real one per address instead of relying
  // solely on the auto-generated QR the buyer-facing widget falls back to.
  const uploadQr = async (a: AdminAddress, file: File) => {
    setSavingId(a.id);
    setError(null);
    try {
      const body = new FormData();
      body.append('qrImage', file);
      const updated = await apiFetch(`/admin/crypto/addresses/${a.id}/qr`, { method: 'POST', body });
      setAddresses((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not upload QR code');
    } finally {
      setSavingId(null);
    }
  };

  const removeQr = async (a: AdminAddress) => {
    setSavingId(a.id);
    setError(null);
    try {
      const updated = await apiFetch(`/admin/crypto/addresses/${a.id}/qr`, { method: 'DELETE' });
      setAddresses((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not remove QR code');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="font-extrabold text-secondary mb-4">Add an address</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as CryptoNetwork)}
            className="bg-gray-50 rounded-2xl px-4 py-3 font-bold text-secondary border-none focus:ring-2 focus:ring-primary/20"
          >
            {NETWORKS.map((n) => (
              <option key={n} value={n}>
                {n} · {NETWORK_LABELS[n]}
              </option>
            ))}
          </select>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Wallet address"
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional)"
            className="md:w-48 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
          <button
            disabled={adding || !address.trim()}
            onClick={addAddress}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </button>
        </div>
        {error && <p className="text-sm font-bold text-red-500 mt-3">{error}</p>}
      </div>

      {loading ? (
        <div className="space-y-8">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-5 w-32 mb-3" />
              <ListRowSkeletonStack count={2} leading="avatar" trailing="buttons" />
            </div>
          ))}
        </div>
      ) : (
        NETWORKS.map((n) => {
          const rows = addresses.filter((a) => a.network === n);
          return (
            <div key={n} className="mb-8">
              <h4 className="font-extrabold text-secondary mb-3">
                {n} · {NETWORK_LABELS[n]}{' '}
                <span className="text-xs text-gray-400 font-bold">
                  ({rows.filter((r) => r.active).length} active)
                </span>
              </h4>
              {rows.length === 0 ? (
                <p className="text-sm text-gray-400">No addresses yet — buyers picking {n} will see an error until you add one.</p>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {rows.map((a) => (
                    <div key={a.id} className="p-5 flex items-center gap-4">
                      <label
                        className="shrink-0 cursor-pointer group relative"
                        title={a.qrImage ? 'Replace QR code' : 'Add a QR code for this address'}
                      >
                        {a.qrImage ? (
                          // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL
                          <img
                            src={a.qrImage}
                            alt="QR code"
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 group-hover:opacity-70 transition-opacity"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-primary group-hover:text-primary transition-colors">
                            <QrCode className="h-5 w-5" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={savingId === a.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadQr(a, file);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm text-secondary truncate">{a.address}</p>
                        {a.label && <p className="text-xs text-gray-400 mt-0.5">{a.label}</p>}
                        {a.qrImage && (
                          <button
                            disabled={savingId === a.id}
                            onClick={() => removeQr(a)}
                            className="text-[11px] font-bold text-red-500 hover:underline mt-0.5 disabled:opacity-50"
                          >
                            Remove QR
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!a.active && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-gray-100 text-gray-500">
                            Inactive
                          </span>
                        )}
                        <button
                          disabled={savingId === a.id}
                          onClick={() => toggleActive(a)}
                          className={`px-4 py-2 rounded-2xl text-sm font-bold border disabled:opacity-50 ${
                            a.active
                              ? 'bg-white border-amber-100 text-amber-600 hover:bg-amber-50'
                              : 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {a.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          disabled={savingId === a.id}
                          onClick={() => remove(a)}
                          className="flex items-center gap-1 bg-white border border-red-100 text-red-600 px-4 py-2 rounded-2xl text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ---- Payment review tab ----

const STATUS_FILTERS: (PaymentStatus | 'ALL')[] = ['PENDING', 'CONFIRMED', 'REJECTED', 'ALL'];

function PaymentsTab() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('PENDING');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async (status: PaymentStatus | 'ALL') => {
    setLoading(true);
    setError(null);
    try {
      setPayments(await apiFetch(`/admin/crypto/payments${status === 'ALL' ? '' : `?status=${status}`}`));
    } catch {
      setError('Could not load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const review = async (p: AdminPayment, status: 'CONFIRMED' | 'REJECTED') => {
    setSavingId(p.id);
    setError(null);
    try {
      await apiFetch(`/admin/crypto/payments/${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewNote: notes[p.id]?.trim() || undefined }),
      });
      setPayments((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not update payment');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold border ${
              filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
        <button onClick={() => load(filter)} className="ml-auto text-gray-400 hover:text-primary">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
      {loading ? (
        <ListRowSkeletonStack count={4} leading="avatar" trailing="buttons" />
      ) : payments.length === 0 ? (
        <p className="text-gray-400 font-bold">Nothing here.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {p.proofImage && (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, arbitrary sizes
                  <a href={p.proofImage} target="_blank" rel="noreferrer" className="shrink-0">
                    <img src={p.proofImage} alt="Payment proof" className="w-32 h-32 object-cover rounded-2xl border border-gray-100" />
                  </a>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-extrabold text-secondary">
                      {NETWORK_LABELS[p.network]} {p.amountUsd ? `· $${p.amountUsd.toLocaleString()}` : ''}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                        p.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-600'
                          : p.status === 'CONFIRMED'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {p.user.name || p.user.email} &middot; sent to{' '}
                    <span className="font-mono">{p.address.address.slice(0, 10)}…</span>
                  </p>
                  {p.property && (
                    <Link href={`/property/${p.property.id}`} className="text-sm text-primary font-bold hover:underline">
                      {p.property.title}
                    </Link>
                  )}
                  {p.deal && (
                    <p className="text-xs text-gray-400">
                      Linked deal: {p.deal.currency} {p.deal.amount.toLocaleString()}
                    </p>
                  )}
                  {p.txHash && <p className="text-xs font-mono text-gray-500 mt-1 break-all">Tx: {p.txHash}</p>}
                  {p.note && <p className="text-sm text-gray-500 mt-1">&ldquo;{p.note}&rdquo;</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(p.createdAt).toLocaleString()}</p>

                  {p.status === 'PENDING' && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        value={notes[p.id] || ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Note (optional, shown to buyer)"
                        className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                      <button
                        disabled={savingId === p.id}
                        onClick={() => review(p, 'CONFIRMED')}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-2xl text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Confirm
                      </button>
                      <button
                        disabled={savingId === p.id}
                        onClick={() => review(p, 'REJECTED')}
                        className="flex items-center gap-1.5 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-2xl text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                  {p.reviewNote && <p className="text-xs text-gray-400 mt-2">Review note: {p.reviewNote}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Guide images tab ----

function GuideTab() {
  const [images, setImages] = useState<AdminGuideImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<CryptoNetwork | 'ALL'>('ALL');
  const [step, setStep] = useState('1');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setImages(await apiFetch('/admin/crypto/guide'));
    } catch {
      setError('Could not load guide images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      if (network !== 'ALL') body.append('network', network);
      body.append('step', step);
      if (caption.trim()) body.append('caption', caption.trim());
      body.append('image', file);
      const created = await apiFetch('/admin/crypto/guide', { method: 'POST', body });
      setImages((prev) => [...prev, created]);
      setCaption('');
      setFile(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this guide step?')) return;
    setSavingId(id);
    try {
      await apiFetch(`/admin/crypto/guide/${id}`, { method: 'DELETE' });
      setImages((prev) => prev.filter((i) => i.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not remove image');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="font-extrabold text-secondary mb-4">Add a step</h3>
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as CryptoNetwork | 'ALL')}
            className="bg-gray-50 rounded-2xl px-4 py-3 font-bold text-secondary border-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">Generic (any network)</option>
            {NETWORKS.map((n) => (
              <option key={n} value={n}>
                {n} only
              </option>
            ))}
          </select>
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(e.target.value)}
            placeholder="Step #"
            className="md:w-28 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center gap-2 border border-dashed border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-500 cursor-pointer hover:border-primary">
            <ImagePlus className="h-4 w-4 shrink-0" />
            <span className="truncate">{file ? file.name : 'Choose screenshot'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <button
            disabled={uploading || !file}
            onClick={upload}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Upload
          </button>
        </div>
        {error && <p className="text-sm font-bold text-red-500 mt-3">{error}</p>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Skeleton className="w-full h-32 rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <p className="text-gray-400 font-bold">No guide steps yet. Buyers who tap &quot;How do I buy crypto?&quot; will see an empty guide.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images
            .sort((a, b) => (a.network || '').localeCompare(b.network || '') || a.step - b.step)
            .map((img) => (
              <div key={img.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL */}
                <img src={img.imageUrl} alt={img.caption || `Step ${img.step}`} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    {img.network || 'Generic'} · Step {img.step}
                  </p>
                  {img.caption && <p className="text-xs text-secondary mt-1 line-clamp-2">{img.caption}</p>}
                  <button
                    disabled={savingId === img.id}
                    onClick={() => remove(img.id)}
                    className="mt-2 flex items-center gap-1 text-xs font-bold text-red-600 hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function CryptoAdmin() {
  const [tab, setTab] = useState<Tab>('payments');

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-primary font-bold mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Bitcoin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-secondary">Crypto payments</h1>
            <p className="text-gray-500 mt-1">Manage receiving addresses, review submitted payments, and edit the buying guide.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 font-bold text-sm border-b-2 -mb-px transition-colors ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'payments' && <PaymentsTab />}
        {tab === 'addresses' && <AddressesTab />}
        {tab === 'guide' && <GuideTab />}
      </div>
    </div>
  );
}

export default function AdminCryptoPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <CryptoAdmin />
    </RequireRole>
  );
}
