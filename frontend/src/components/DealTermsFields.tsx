'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { InstallmentDraft, PaymentPlan } from '@/lib/deals';

export type DealTermsValue = {
  amount: string;
  currency: string;
  paymentPlan: PaymentPlan;
  installments: InstallmentDraft[];
  note: string;
};

export function emptyInstallment(): InstallmentDraft {
  return { amount: 0, dueDate: '' };
}

const installmentsTotal = (installments: InstallmentDraft[]) =>
  installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

/** Reusable amount / payment-plan / installment-schedule editor, shared by the
 * "propose a deal" and "counter" flows so both stay in sync. */
export default function DealTermsFields({
  value,
  onChange,
}: {
  value: DealTermsValue;
  onChange: (next: DealTermsValue) => void;
}) {
  const total = installmentsTotal(value.installments);
  const amountNum = Number(value.amount) || 0;
  const mismatch = value.paymentPlan === 'INSTALLMENT' && Math.abs(total - amountNum) > 0.01;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount</label>
          <input
            type="number"
            min={0}
            value={value.amount}
            onChange={(e) => onChange({ ...value, amount: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Currency</label>
          <input
            type="text"
            value={value.currency}
            onChange={(e) => onChange({ ...value, currency: e.target.value.toUpperCase() })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {(['FULL', 'INSTALLMENT'] as const).map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => onChange({ ...value, paymentPlan: plan })}
            className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
              value.paymentPlan === plan
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {plan === 'FULL' ? 'Pay in full' : 'Installments'}
          </button>
        ))}
      </div>

      {value.paymentPlan === 'INSTALLMENT' && (
        <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          {value.installments.map((inst, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}.</span>
              <input
                type="number"
                min={0}
                placeholder="Amount"
                value={inst.amount || ''}
                onChange={(e) => {
                  const next = [...value.installments];
                  next[idx] = { ...next[idx], amount: Number(e.target.value) };
                  onChange({ ...value, installments: next });
                }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={inst.dueDate ? inst.dueDate.slice(0, 10) : ''}
                onChange={(e) => {
                  const next = [...value.installments];
                  next[idx] = { ...next[idx], dueDate: e.target.value };
                  onChange({ ...value, installments: next });
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => onChange({ ...value, installments: value.installments.filter((_, i) => i !== idx) })}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...value, installments: [...value.installments, emptyInstallment()] })}
            className="flex items-center gap-1 text-sm font-bold text-primary"
          >
            <Plus className="h-4 w-4" /> Add installment
          </button>
          <p className={`text-xs font-bold ${mismatch ? 'text-red-500' : 'text-gray-400'}`}>
            Scheduled: {total.toLocaleString()} / {amountNum.toLocaleString()} {value.currency}
            {mismatch ? ' — must add up to the total amount' : ''}
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Note (optional)</label>
        <textarea
          value={value.note}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
          placeholder="Anything the other party should know about these terms"
        />
      </div>
    </div>
  );
}

export { installmentsTotal };
