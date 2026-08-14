'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { cancelDeal, confirmDeal, counterDeal, partyFor, type Deal } from '@/lib/deals';
import DealTermsFields, { type DealTermsValue } from './DealTermsFields';

const STATUS_STYLES: Record<Deal['status'], string> = {
  PROPOSED: 'bg-amber-50 text-amber-700',
  COUNTERED: 'bg-amber-50 text-amber-700',
  AGREED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function toFormValue(deal: Deal): DealTermsValue {
  return {
    amount: String(deal.amount),
    currency: deal.currency,
    paymentPlan: deal.paymentPlan,
    installments: deal.installments.map((i) => ({ amount: i.amount, dueDate: i.dueDate })),
    note: deal.note || '',
  };
}

export default function DealCard({
  deal,
  userId,
  onChange,
  showProperty = true,
}: {
  deal: Deal;
  userId: string | undefined;
  onChange: (updated: Deal) => void;
  showProperty?: boolean;
}) {
  const [countering, setCountering] = useState(false);
  const [form, setForm] = useState<DealTermsValue>(() => toFormValue(deal));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const party = partyFor(deal, userId);
  const active = deal.status === 'PROPOSED' || deal.status === 'COUNTERED';
  const waitingOnMe = active && deal.lastProposedBy !== party;
  const otherPartyName = party === 'AGENT' ? deal.client.name || deal.client.email : deal.agent.user.name || deal.agent.user.email;

  const runAction = async (fn: () => Promise<Deal>) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await fn();
      onChange(updated);
      setCountering(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const submitCounter = () => {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    runAction(() =>
      counterDeal(deal.id, {
        amount,
        currency: form.currency,
        paymentPlan: form.paymentPlan,
        installments: form.paymentPlan === 'INSTALLMENT' ? form.installments : undefined,
        note: form.note,
      })
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
      {showProperty && (
        <div className="text-sm font-bold text-gray-400">{deal.property.title}</div>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${STATUS_STYLES[deal.status]}`}>
          {deal.status}
        </span>
        <span className="text-2xl font-extrabold text-secondary">
          {deal.currency} {deal.amount.toLocaleString()}
        </span>
      </div>

      <p className="text-sm text-gray-500">
        With <span className="font-bold text-secondary">{otherPartyName}</span> ·{' '}
        {deal.paymentPlan === 'FULL' ? 'Pay in full' : `${deal.installments.length} installments`}
      </p>

      {deal.paymentPlan === 'INSTALLMENT' && deal.installments.length > 0 && (
        <ul className="space-y-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm">
          {deal.installments.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-gray-500">
                #{i.seq} · due {new Date(i.dueDate).toLocaleDateString()}
              </span>
              <span className="font-bold text-secondary">
                {deal.currency} {i.amount.toLocaleString()} {i.paid ? '· paid' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      {deal.note && <p className="text-sm text-gray-500 italic">&ldquo;{deal.note}&rdquo;</p>}

      {deal.status === 'AGREED' && (
        <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
          <CheckCircle2 className="h-4 w-4" /> Both sides agreed
          {deal.agreedAt ? ` on ${new Date(deal.agreedAt).toLocaleDateString()}` : ''}
        </div>
      )}
      {deal.status === 'CANCELLED' && (
        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
          <XCircle className="h-4 w-4" /> This deal was cancelled
        </div>
      )}
      {active && !waitingOnMe && (
        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
          <Clock className="h-4 w-4" /> Waiting for {otherPartyName} to respond
        </div>
      )}

      {error && <p className="text-sm font-bold text-red-500">{error}</p>}

      {active && party && !countering && (
        <div className="flex flex-wrap gap-3 pt-2">
          {waitingOnMe && (
            <button
              disabled={busy}
              onClick={() => runAction(() => confirmDeal(deal.id))}
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Accept terms
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => setCountering(true)}
            className="px-5 py-3 rounded-xl font-bold border-2 border-gray-200 text-secondary hover:border-primary/30"
          >
            Propose different terms
          </button>
          <button
            disabled={busy}
            onClick={() => runAction(() => cancelDeal(deal.id))}
            className="px-5 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50"
          >
            Cancel deal
          </button>
        </div>
      )}

      {active && party && countering && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <DealTermsFields value={form} onChange={setForm} />
          <div className="flex gap-3">
            <button
              disabled={busy}
              onClick={submitCounter}
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send counter-proposal
            </button>
            <button
              disabled={busy}
              onClick={() => {
                setCountering(false);
                setForm(toFormValue(deal));
                setError(null);
              }}
              className="px-5 py-3 rounded-xl font-bold border-2 border-gray-200 text-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
