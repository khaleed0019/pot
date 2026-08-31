'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Check, Copy, HelpCircle, Loader2, RefreshCw, Upload, Wallet, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NETWORK_LOGOS, NETWORK_THEME } from '@/components/CryptoLogos';
import {
  NETWORK_LABELS,
  getCryptoGuide,
  requestCryptoAddress,
  submitCryptoPayment,
  type CryptoAddress,
  type CryptoGuideImage,
  type CryptoNetwork,
} from '@/lib/crypto';

const NETWORKS: CryptoNetwork[] = ['BTC', 'ETH', 'SOL'];

/**
 * Buyer-facing "pay with crypto" widget. Standalone and reusable: drop it on
 * a property page with just a propertyId, or pass a dealId once an agent and
 * client have agreed terms so the submitted payment links back to that deal.
 *
 * Address handed out per network rotates round-robin server-side (see
 * requestCryptoAddress) — reselecting a network or hitting "show another
 * address" both request a fresh one from the pool.
 */
export default function CryptoPaymentSection({
  propertyId,
  dealId,
  amountUsd,
}: {
  propertyId?: string;
  dealId?: string;
  amountUsd?: number;
}) {
  const { appUser, loading: authLoading } = useAuth();
  const [network, setNetwork] = useState<CryptoNetwork>('BTC');
  const [address, setAddress] = useState<CryptoAddress | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [guideOpen, setGuideOpen] = useState(false);
  const [guide, setGuide] = useState<CryptoGuideImage[] | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [note, setNote] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const theme = NETWORK_THEME[network];

  const loadAddress = useCallback(async (net: CryptoNetwork) => {
    setAddressLoading(true);
    setAddressError(null);
    setAddress(null);
    setQrDataUrl(null);
    try {
      const addr = await requestCryptoAddress(net);
      setAddress(addr);
      if (addr.qrImage) {
        // Admin uploaded this address's real wallet QR — it can encode an
        // amount or memo/tag a plain "network:address" URI can't, so prefer
        // it over generating one from the address text alone.
        setQrDataUrl(addr.qrImage);
      } else {
        const uri =
          net === 'ETH'
            ? `ethereum:${addr.address}`
            : net === 'BTC'
            ? `bitcoin:${addr.address}`
            : addr.address; // Solana has no single standard URI scheme in wide use
        setQrDataUrl(await QRCode.toDataURL(uri, { margin: 1, width: 220 }));
      }
    } catch (e: unknown) {
      setAddressError(e instanceof Error ? e.message : 'Could not load a payment address');
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!appUser) return;
    loadAddress(network);
    setFormOpen(false);
    setSubmitted(false);
  }, [network, appUser, loadAddress]);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGuide = async () => {
    setGuideOpen(true);
    setGuideStep(0);
    if (guide) return;
    setGuideLoading(true);
    try {
      setGuide(await getCryptoGuide(network));
    } catch {
      setGuide([]);
    } finally {
      setGuideLoading(false);
    }
  };

  const submit = async () => {
    if (!address) return;
    if (!proof && !txHash.trim()) {
      setSubmitError('Attach a screenshot or paste the transaction hash so we can verify it');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitCryptoPayment({
        network,
        addressId: address.id,
        propertyId,
        dealId,
        amountUsd,
        txHash: txHash.trim() || undefined,
        note: note.trim() || undefined,
        proof: proof || undefined,
      });
      setSubmitted(true);
      setFormOpen(false);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Could not submit your payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  if (!appUser) {
    return (
      <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100 text-center">
        <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-extrabold text-secondary mb-2">Pay with crypto</h3>
        <p className="text-gray-500 mb-5">Sign in to get a payment address for BTC, ETH, or SOL.</p>
        <Link
          href="/login"
          className="inline-block bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] shadow-xl p-10 border border-gray-100 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-secondary">Pay with crypto</h3>
            <p className="text-xs text-gray-400 font-bold">Bitcoin, Ethereum, or Solana</p>
          </div>
        </div>
        <button
          onClick={openGuide}
          className="flex items-center gap-1.5 text-primary font-bold text-sm hover:underline"
        >
          <HelpCircle className="h-4 w-4" /> How do I buy crypto?
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {NETWORKS.map((n) => {
          const Logo = NETWORK_LOGOS[n];
          const t = NETWORK_THEME[n];
          const active = network === n;
          return (
            <button
              key={n}
              onClick={() => setNetwork(n)}
              className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all ${
                active ? `${t.border} ${t.bg} ring-4 ${t.ring}` : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <Logo className="h-9 w-9 shrink-0" />
              <span className={`text-sm font-extrabold ${active ? t.text : 'text-secondary'}`}>
                {NETWORK_LABELS[n]}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{n}</span>
            </button>
          );
        })}
      </div>

      {addressLoading && (
        <div className="flex items-center justify-center py-10 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Getting a {NETWORK_LABELS[network]} address...
        </div>
      )}

      {addressError && !addressLoading && (
        <div className="text-center py-6">
          <p className="text-red-500 font-semibold mb-3">{addressError}</p>
          <button
            onClick={() => loadAddress(network)}
            className="text-primary font-bold text-sm hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {address && !addressLoading && (
        <div className={`rounded-3xl p-6 sm:p-8 border ${theme.bg} border-gray-100`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {qrDataUrl && (
              <div className={`p-2 rounded-2xl border-2 ${theme.border} bg-white shrink-0`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- locally generated data: URL, not a remote asset */}
                <img src={qrDataUrl} alt={`${network} address QR code`} className="rounded-xl w-36 h-36" />
              </div>
            )}
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Logo = NETWORK_LOGOS[network];
                  return <Logo className="h-5 w-5 shrink-0" />;
                })()}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Send {NETWORK_LABELS[network]} to
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <code className="text-sm font-mono text-secondary break-all flex-1">{address.address}</code>
                <button
                  onClick={copyAddress}
                  className="shrink-0 text-gray-400 hover:text-primary"
                  title="Copy address"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={() => loadAddress(network)}
                className={`flex items-center gap-1.5 text-xs font-bold text-gray-400 ${theme.hoverText} mt-3`}
              >
                <RefreshCw className="h-3 w-3" /> Show a different address
              </button>

              {submitted ? (
                <div className="mt-5 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                  <p className="font-bold text-green-800">Payment submitted for review</p>
                  <p className="text-sm text-green-700 mt-1">
                    We&apos;ll verify it and confirm shortly.{' '}
                    <Link href="/dashboard/crypto" className="underline">
                      Track its status
                    </Link>
                    .
                  </p>
                </div>
              ) : formOpen ? (
                <div className="mt-5 space-y-3">
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Transaction hash (optional if you attach a screenshot)"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary bg-white"
                  />
                  <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-500 cursor-pointer hover:border-primary bg-white">
                    <Upload className="h-4 w-4 shrink-0" />
                    <span className="truncate">{proof ? proof.name : 'Attach a payment screenshot'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setProof(e.target.files?.[0] || null)}
                    />
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note (optional)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none bg-white"
                  />
                  {submitError && <p className="text-sm font-bold text-red-500">{submitError}</p>}
                  <div className="flex gap-3">
                    <button
                      disabled={submitting}
                      onClick={submit}
                      className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit for review
                    </button>
                    <button
                      onClick={() => setFormOpen(false)}
                      className="px-5 py-3 rounded-2xl font-bold text-gray-400 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setFormOpen(true)}
                  className="w-full mt-5 bg-primary text-white py-3 rounded-2xl font-bold hover:bg-blue-700"
                >
                  I&apos;ve sent the payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {guideOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setGuideOpen(false)}>
          <div
            className="bg-white rounded-[32px] max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-extrabold text-secondary">How to buy {NETWORK_LABELS[network]}</h4>
              <button onClick={() => setGuideOpen(false)} className="text-gray-400 hover:text-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {guideLoading && (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading guide...
              </div>
            )}

            {!guideLoading && guide && guide.length === 0 && (
              <p className="text-gray-500 text-center py-16">
                No guide has been added for {network} yet. Contact us if you need help buying crypto.
              </p>
            )}

            {!guideLoading && guide && guide.length > 0 && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded Cloudinary URL */}
                <img
                  src={guide[guideStep].imageUrl}
                  alt={guide[guideStep].caption || `Step ${guideStep + 1}`}
                  className="w-full rounded-2xl border border-gray-100 mb-4"
                />
                {guide[guideStep].caption && (
                  <p className="text-secondary font-semibold text-center mb-4">{guide[guideStep].caption}</p>
                )}
                <div className="flex items-center justify-between">
                  <button
                    disabled={guideStep === 0}
                    onClick={() => setGuideStep((s) => s - 1)}
                    className="text-sm font-bold text-gray-400 disabled:opacity-30 hover:text-primary"
                  >
                    Back
                  </button>
                  <p className="text-xs font-bold text-gray-400">
                    Step {guideStep + 1} of {guide.length}
                  </p>
                  <button
                    disabled={guideStep === guide.length - 1}
                    onClick={() => setGuideStep((s) => s + 1)}
                    className="text-sm font-bold text-gray-400 disabled:opacity-30 hover:text-primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
