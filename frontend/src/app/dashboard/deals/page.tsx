'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, HandCoins } from 'lucide-react';
import RequireRole from '@/components/RequireRole';
import { useAuth } from '@/contexts/AuthContext';
import DealCard from '@/components/DealCard';
import { listMyDeals, type Deal } from '@/lib/deals';

function MyDeals() {
  const { appUser } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await listMyDeals();
      setDeals(all.filter((d) => d.clientId === appUser?.id));
    } catch {
      setError('Could not load deals');
    } finally {
      setLoading(false);
    }
  }, [appUser?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <HandCoins className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-secondary">My deals</h1>
          <p className="text-gray-400 font-bold text-sm">Payment terms you&apos;ve proposed or been offered</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading deals...
        </div>
      )}
      {error && <p className="text-red-500 font-bold">{error}</p>}
      {!loading && !error && deals.length === 0 && (
        <p className="text-gray-400 font-bold">No deals yet. Propose payment terms from any property page to get started.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            userId={appUser?.id}
            onChange={(updated) => setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardDealsPage() {
  return (
    <RequireRole roles={['USER', 'AGENT', 'ADMIN']}>
      <MyDeals />
    </RequireRole>
  );
}
