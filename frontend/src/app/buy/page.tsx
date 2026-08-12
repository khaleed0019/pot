import { Suspense } from 'react';
import ListingsExplorer from '@/components/ListingsExplorer';

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading listings...</div>}>
      <ListingsExplorer type="SALE" heading="Homes for Sale" />
    </Suspense>
  );
}
