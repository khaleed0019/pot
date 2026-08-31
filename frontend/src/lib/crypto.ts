import { apiFetch, publicFetch } from './api';

export type CryptoNetwork = 'BTC' | 'ETH' | 'SOL';
export type CryptoPaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export type CryptoAddress = {
  id: string;
  network: CryptoNetwork;
  address: string;
  /** Admin-uploaded QR image for this specific address, if any — shown instead of the auto-generated one. */
  qrImage?: string | null;
};

export type CryptoGuideImage = {
  id: string;
  network: CryptoNetwork | null;
  step: number;
  imageUrl: string;
  caption: string | null;
};

export type CryptoPayment = {
  id: string;
  network: CryptoNetwork;
  status: CryptoPaymentStatus;
  amountUsd: number | null;
  txHash: string | null;
  proofImage: string | null;
  note: string | null;
  reviewNote: string | null;
  createdAt: string;
  address: { network: CryptoNetwork; address: string };
  property: { id: string; title: string; coverImage: string | null } | null;
};

export const NETWORK_LABELS: Record<CryptoNetwork, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
};

export const requestCryptoAddress = (network: CryptoNetwork): Promise<CryptoAddress> =>
  apiFetch(`/crypto/address/${network}`);

export const getCryptoGuide = (network?: CryptoNetwork): Promise<CryptoGuideImage[]> =>
  publicFetch(`/crypto/guide${network ? `?network=${network}` : ''}`);

export const submitCryptoPayment = (form: {
  network: CryptoNetwork;
  addressId: string;
  propertyId?: string;
  dealId?: string;
  amountUsd?: number;
  txHash?: string;
  note?: string;
  proof?: File;
}): Promise<CryptoPayment> => {
  const body = new FormData();
  body.append('network', form.network);
  body.append('addressId', form.addressId);
  if (form.propertyId) body.append('propertyId', form.propertyId);
  if (form.dealId) body.append('dealId', form.dealId);
  if (form.amountUsd) body.append('amountUsd', String(form.amountUsd));
  if (form.txHash) body.append('txHash', form.txHash);
  if (form.note) body.append('note', form.note);
  if (form.proof) body.append('proof', form.proof);
  return apiFetch('/crypto/payments', { method: 'POST', body });
};

export const listMyCryptoPayments = (): Promise<CryptoPayment[]> => apiFetch('/crypto/payments/mine');
