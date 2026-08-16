import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Thank You',
  description: "We've received your submission.",
  robots: { index: false }, // Confirmation pages aren't useful search results.
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="max-w-xl w-full text-center">
        <div className="bg-green-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-secondary mb-6">Thank you!</h1>
        <p className="text-xl text-gray-500 mb-12">
          We&apos;ve received your submission and someone from our team will be in touch shortly.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/buy"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-secondary px-8 py-4 rounded-2xl font-bold hover:border-primary/20 transition-all"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
