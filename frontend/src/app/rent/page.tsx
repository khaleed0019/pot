import { Suspense } from 'react';
import type { Metadata } from 'next';
import ListingsExplorer from '@/components/ListingsExplorer';

export const metadata: Metadata = {
  title: 'Homes for Rent',
  description: 'Find apartments, houses, and condos for rent across the USA — filter by price, beds, baths, and home type.',
};

export default function RentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading listings...</div>}>
      <ListingsExplorer type="RENT" heading="Homes for Rent" />
    </Suspense>
  );
}
