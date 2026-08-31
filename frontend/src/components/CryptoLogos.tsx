'use client';

import { useId } from 'react';

type LogoProps = { className?: string };

/** Bitcoin — orange coin with the ₿ glyph. */
export function BitcoinLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        fill="#fff"
        d="M22.5 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7-1-.2-2.2-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.1.2.1-.2-.1-1.1 4.4c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.1.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.7.5 4.8.3 5.6-2.1.7-2-.1-3.1-1.5-3.9 1-.3 1.8-1 2-2.5zm-3.6 5.1c-.5 2-3.9.9-5 .6l.9-3.6c1.1.3 4.6.8 4.1 3zm.5-5.2c-.5 1.8-3.3.9-4.2.7l.8-3.3c.9.2 3.9.6 3.4 2.6z"
      />
    </svg>
  );
}

/** Ethereum — the faceted diamond mark on its signature indigo. */
export function EthereumLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#fff">
        <path fillOpacity="0.6" d="M16.5 4v8.6l7.3 3.3z" />
        <path d="M16.5 4 9.2 15.9l7.3-3.3z" />
        <path fillOpacity="0.6" d="M16.5 21.9V28l7.3-10.1z" />
        <path d="M16.5 28v-6.1l-7.3-4z" />
        <path fillOpacity="0.2" d="M16.5 20.5l7.3-4.3-7.3-3.3z" />
        <path fillOpacity="0.6" d="M9.2 16.2l7.3 4.3v-7.6z" />
      </g>
    </svg>
  );
}

/** Solana — three parallel bars in the green-to-purple gradient on black. */
export function SolanaLogo({ className }: LogoProps) {
  const gradId = `sol-grad-${useId()}`;
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#000" />
      <defs>
        <linearGradient id={gradId} x1="6" y1="9" x2="26" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gradId})`}>
        <path d="M9.4 20.6a1 1 0 01.7-.3h14.5a.45.45 0 01.32.77l-2.85 2.85a1 1 0 01-.7.3H6.34a.45.45 0 01-.32-.77l2.85-2.85z" />
        <path d="M9.4 8.6a1 1 0 01.7-.3h14.5a.45.45 0 01.32.77l-2.85 2.85a1 1 0 01-.7.3H6.34a.45.45 0 01-.32-.77L9.4 8.6z" />
        <path d="M22.6 14.6a1 1 0 00-.7-.3H7.4a.45.45 0 00-.32.77l2.85 2.85a1 1 0 00.7.3h14.5a.45.45 0 00.32-.77l-2.85-2.85z" />
      </g>
    </svg>
  );
}

export const NETWORK_LOGOS = {
  BTC: BitcoinLogo,
  ETH: EthereumLogo,
  SOL: SolanaLogo,
} as const;

/**
 * Brand accent used to tint the selected network's card, address panel, and
 * QR frame. Every variant (including the `hover:` one) is spelled out as a
 * full literal string here — Tailwind's scanner only generates CSS for class
 * names it can find verbatim in source, so composing `hover:${text}` at
 * runtime elsewhere would silently produce no rule at all.
 */
export const NETWORK_THEME = {
  BTC: {
    border: 'border-[#F7931A]',
    bg: 'bg-[#F7931A]/[0.06]',
    text: 'text-[#F7931A]',
    hoverText: 'hover:text-[#F7931A]',
    ring: 'ring-[#F7931A]/20',
  },
  ETH: {
    border: 'border-[#627EEA]',
    bg: 'bg-[#627EEA]/[0.06]',
    text: 'text-[#627EEA]',
    hoverText: 'hover:text-[#627EEA]',
    ring: 'ring-[#627EEA]/20',
  },
  SOL: {
    border: 'border-[#9945FF]',
    bg: 'bg-[#9945FF]/[0.06]',
    text: 'text-[#9945FF]',
    hoverText: 'hover:text-[#9945FF]',
    ring: 'ring-[#9945FF]/20',
  },
} as const;
