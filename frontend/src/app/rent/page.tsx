import { Suspense } from 'react';
import ListingsExplorer from '@/components/ListingsExplorer';

export default function RentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading listings...</div>}>
      <ListingsExplorer type="RENT" heading="Homes for Rent" />
    </Suspense>
  );
}
