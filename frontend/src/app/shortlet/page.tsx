import { Suspense } from 'react';
import ListingsExplorer from '@/components/ListingsExplorer';

export default function ShortletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading listings...</div>}>
      <ListingsExplorer type="SHORTLET" heading="Short-Term Rentals" />
    </Suspense>
  );
}
