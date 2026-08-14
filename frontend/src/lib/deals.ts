import { apiFetch } from './api';

export type DealStatus = 'PROPOSED' | 'COUNTERED' | 'AGREED' | 'CANCELLED';
export type PaymentPlan = 'FULL' | 'INSTALLMENT';
export type DealParty = 'AGENT' | 'CLIENT';

export type Installment = {
  id: string;
  seq: number;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidAt: string | null;
};

export type Deal = {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    price: number;
    currency: string;
    coverImage: string | null;
    address: string;
    city: string;
  };
  agentId: string;
  agent: {
    id: string;
    userId: string;
    user: { id: string; name: string | null; email: string; profileImage: string | null };
  };
  clientId: string;
  client: { id: string; name: string | null; email: string; profileImage: string | null };
  amount: number;
  currency: string;
  paymentPlan: PaymentPlan;
  installments: Installment[];
  status: DealStatus;
  lastProposedBy: DealParty;
  agentAgreed: boolean;
  clientAgreed: boolean;
  agreedAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InstallmentDraft = { amount: number; dueDate: string };

export type DealTerms = {
  amount: number;
  currency?: string;
  paymentPlan: PaymentPlan;
  installments?: InstallmentDraft[];
  note?: string;
};

/** Which side of a deal the current viewer is on. Null if they're not a party to it. */
export function partyFor(deal: Deal, userId: string | undefined): DealParty | null {
  if (!userId) return null;
  if (deal.agent.userId === userId) return 'AGENT';
  if (deal.clientId === userId) return 'CLIENT';
  return null;
}

export const proposeDeal = (propertyId: string, terms: DealTerms, clientId?: string): Promise<Deal> =>
  apiFetch('/deals', {
    method: 'POST',
    body: JSON.stringify({ propertyId, clientId, ...terms }),
  });

export const listMyDeals = (): Promise<Deal[]> => apiFetch('/deals/mine');

export const getDeal = (id: string): Promise<Deal> => apiFetch(`/deals/${id}`);

export const counterDeal = (id: string, terms: Partial<DealTerms>): Promise<Deal> =>
  apiFetch(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify(terms) });

export const confirmDeal = (id: string): Promise<Deal> =>
  apiFetch(`/deals/${id}/confirm`, { method: 'POST' });

export const cancelDeal = (id: string): Promise<Deal> =>
  apiFetch(`/deals/${id}/cancel`, { method: 'POST' });
