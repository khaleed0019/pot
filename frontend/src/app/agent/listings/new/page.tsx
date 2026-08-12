'use client';

import { Suspense } from 'react';
import ListingWizard from '@/components/listing/ListingWizard';
import RequireRole from '@/components/RequireRole';

export default function NewListingPage() {
  return (
    <RequireRole roles={['AGENT', 'ADMIN']}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading wizard...</div>}>
        <ListingWizard />
      </Suspense>
    </RequireRole>
  );
}
