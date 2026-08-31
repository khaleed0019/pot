'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bitcoin, CheckCircle2, Clock, XCircle } from 'lucide-react';
import RequireRole from '@/components/RequireRole';
import { ListRowSkeletonStack } from '@/components/skeletons/ListRowSkeleton';
import { listMyCryptoPayments, NETWORK_LABELS, type CryptoPayment } from '@/lib/crypto';

const STATUS_STYLE: Record<CryptoPayment['status'], { label: string; tone: string; icon: typeof Clock }> = {
  PENDING: { label: 'Awaiting review', tone: 'text-amber-600 bg-amber-50', icon: Clock },
  CONFIRMED: { label: 'Confirmed', tone: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', tone: 'text-red-600 bg-red-50', icon: XCircle },
};

function MyCryptoPayments() {
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPayments(await listMyCryptoPayments());
    } catch {
      setError('Could not load your payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Bitcoin className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-secondary">My crypto payments</h1>
          <p className="text-gray-400 font-bold text-sm">Track the status of payments you&apos;ve submitted</p>
        </div>
      </div>

      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
      {!loading && !error && payments.length === 0 && (
        <p className="text-gray-400 font-bold">
          No crypto payments yet. Open a property and use &quot;Pay with crypto&quot; to submit one.
        </p>
      )}

      {loading && <ListRowSkeletonStack trailing="pill" />}

      <div className="space-y-4">
        {payments.map((p) => {
          const status = STATUS_STYLE[p.status];
          const StatusIcon = status.icon;
          return (
            <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${status.tone}`}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-secondary">
                  {NETWORK_LABELS[p.network]} {p.amountUsd ? `· $${p.amountUsd.toLocaleString()}` : ''}
                </p>
                {p.property && (
                  <Link href={`/property/${p.property.id}`} className="text-sm text-primary font-bold hover:underline">
                    {p.property.title}
                  </Link>
                )}
                <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                  {p.txHash ? `Tx: ${p.txHash}` : p.proofImage ? 'Screenshot attached' : ''}
                </p>
                {p.reviewNote && <p className="text-xs text-gray-500 mt-1">Note from team: {p.reviewNote}</p>}
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${status.tone}`}>{status.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardCryptoPage() {
  return (
    <RequireRole roles={['USER', 'AGENT', 'ADMIN']}>
      <MyCryptoPayments />
    </RequireRole>
  );
}
