'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/agent/listings/new');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Redirecting to listing wizard...
    </div>
  );
}
