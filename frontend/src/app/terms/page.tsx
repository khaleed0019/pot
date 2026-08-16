import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions for using Property On Set.',
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-secondary mb-6">Terms of Service</h1>
        <p className="text-gray-700 leading-relaxed">
          This is a placeholder Terms of Service. Replace it with your official terms before launch.
        </p>
      </div>
    </div>
  );
}

