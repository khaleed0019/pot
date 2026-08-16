'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Phone } from 'lucide-react';

// Hide on pages where a bottom CTA bar would collide with the page's own
// primary action (auth forms, the multi-step listing wizard, admin/agent
// back-office views nobody browses on a phone).
const HIDDEN_PREFIXES = ['/login', '/signup', '/forgot', '/admin', '/agent', '/dashboard', '/auth'];

export default function StickyMobileCta() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <Link
          href="/buy"
          className="flex items-center justify-center gap-2 py-4 font-bold text-secondary active:bg-gray-50"
        >
          <Search className="h-5 w-5 text-primary" /> Search Homes
        </Link>
        <a
          href="tel:+14155550142"
          className="flex items-center justify-center gap-2 py-4 font-bold text-white bg-primary active:bg-blue-700"
        >
          <Phone className="h-5 w-5" /> Call an Agent
        </a>
      </div>
    </div>
  );
}
