import { Suspense } from 'react';
import type { Metadata } from 'next';
import ListingsExplorer from '@/components/ListingsExplorer';

export const metadata: Metadata = {
  title: 'Short-Term Rentals',
  description: 'Book fully furnished short-term rentals and vacation stays across the USA.',
};

export default function ShortletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading listings...</div>}>
      <ListingsExplorer type="SHORTLET" heading="Short-Term Rentals" />
    </Suspense>
  );
}
