'use client';

import { useEffect, useState } from 'react';
import { Loader2, HandCoins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listMyDeals, proposeDeal, type Deal } from '@/lib/deals';
import DealCard from './DealCard';
import DealTermsFields, { type DealTermsValue } from './DealTermsFields';

/**
 * Client-facing "agree on payment terms" widget for a property page. Shows the
 * viewer's existing deal on this listing if one exists, otherwise lets them
 * propose one (full payment or an installment schedule) to the listing agent.
 * Nothing here moves money — it just records terms both sides confirm.
 */
export default function DealPanel({
  propertyId,
  agentUserId,
  defaultAmount,
  defaultCurrency,
}: {
  propertyId: string;
  agentUserId?: string;
  defaultAmount: number;
  defaultCurrency: string;
}) {
  const { appUser, loading: authLoading } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<DealTermsValue>({
    amount: String(defaultAmount || ''),
    currency: defaultCurrency || 'USD',
    paymentPlan: 'FULL',
    installments: [],
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appUser) {
      setLoading(false);
      return;
    }
    listMyDeals()
      .then((deals) => setDeal(deals.find((d) => d.propertyId === propertyId) || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appUser, propertyId]);

  if (authLoading || loading) {
    return (
      <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100 flex items-center justify-center text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Checking for an existing deal...
      </div>
    );
  }

  if (!appUser) {
    return null; // Only registered users negotiate deals; anonymous visitors use call/WhatsApp.
  }

  if (agentUserId && appUser.id === agentUserId) {
    return null; // Agents propose deals from their dashboard, not their own listing page.
  }

  if (deal) {
    return <DealCard deal={deal} userId={appUser.id} onChange={setDeal} showProperty={false} />;
  }

  const submit = async () => {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await proposeDeal(propertyId, {
        amount,
        currency: form.currency,
        paymentPlan: form.paymentPlan,
        installments: form.paymentPlan === 'INSTALLMENT' ? form.installments : undefined,
        note: form.note,
      });
      setDeal(created);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not propose these terms');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <HandCoins className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-secondary">Agree on payment terms</h3>
          <p className="text-xs text-gray-400 font-bold">Propose full payment or an installment plan to the agent</p>
        </div>
      </div>

      <DealTermsFields value={form} onChange={setForm} />

      {error && <p className="text-sm font-bold text-red-500">{error}</p>}

      <button
        disabled={submitting}
        onClick={submit}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Send proposal to agent
      </button>
    </div>
  );
}
