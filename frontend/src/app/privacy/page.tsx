import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Property On Set collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-secondary mb-6">Privacy Policy</h1>
        <p className="text-gray-700 leading-relaxed">
          This is a placeholder privacy policy. Replace it with your legal policy before launch.
        </p>
      </div>
    </div>
  );
}

