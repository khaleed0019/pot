import Link from 'next/link';
import { Home, Search, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found | Property On Set',
  description: 'The page you were looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="max-w-xl w-full text-center">
        <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
        <p className="text-primary font-extrabold text-lg mb-2">404</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-secondary mb-6">
          This listing has moved
        </h1>
        <p className="text-xl text-gray-500 mb-12">
          The page you&apos;re looking for doesn&apos;t exist or may have been taken down.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
          >
            <Home className="h-5 w-5" /> Back to Home
          </Link>
          <Link
            href="/buy"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-secondary px-8 py-4 rounded-2xl font-bold hover:border-primary/20 transition-all"
          >
            <Search className="h-5 w-5" /> Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
