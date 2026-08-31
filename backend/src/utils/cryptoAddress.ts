import type { CryptoNetwork } from '@prisma/client';

/**
 * Loose sanity check on address *shape* per network — not a checksum or
 * on-chain validation. Just enough to catch an obvious typo/wrong-network
 * paste before admin saves it into the rotation pool.
 */
export function isValidAddressForNetwork(network: CryptoNetwork, address: string): boolean {
  const a = address.trim();
  switch (network) {
    case 'BTC':
      return /^(bc1[a-z0-9]{25,89}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(a);
    case 'ETH':
      return /^0x[a-fA-F0-9]{40}$/.test(a);
    case 'SOL':
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
    default:
      return false;
  }
}

export const CRYPTO_NETWORKS: CryptoNetwork[] = ['BTC', 'ETH', 'SOL'];
