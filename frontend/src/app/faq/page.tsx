import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about buying, renting, selling, and investing with Property On Set.',
};

const FAQS = [
  {
    q: 'How do I schedule a viewing for a property?',
    a: "Open any listing and use the \"Book a Viewing\" or \"WhatsApp\"/\"Call now\" buttons on the property page to reach the listing agent directly. They'll coordinate a time that works for you.",
  },
  {
    q: 'What documents do I need to buy a home?',
    a: 'Typically a government-issued ID, proof of income (pay stubs or tax returns), bank statements, and a mortgage pre-approval letter if you\'re financing. Your agent can confirm exactly what your lender requires.',
  },
  {
    q: 'Is there a fee to search or browse listings?',
    a: 'No — browsing, searching, and viewing listings on Property On Set is completely free for buyers and renters.',
  },
  {
    q: 'How do I list my property for sale or rent?',
    a: 'Sign up for an agent account, then use "New listing" from your agent dashboard to submit your property. Listings go live after a quick admin review.',
  },
  {
    q: "What's the difference between Buy, Rent, and Shortlet?",
    a: '"Buy" listings are homes for sale, "Rent" listings are traditional long-term rentals, and "Shortlet" listings are furnished short-term/vacation stays booked for days or weeks.',
  },
] as const;

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-secondary mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-500">Everything you need to know before you buy, rent, or invest.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group"
            >
              <summary className="font-bold text-secondary cursor-pointer list-none flex items-center justify-between">
                {item.q}
                <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>

        <p className="text-center text-gray-500 mt-12">
          Still have questions?{' '}
          <Link href="/agents" className="text-primary font-bold hover:underline">
            Talk to an agent
          </Link>
        </p>
      </div>
    </div>
  );
}
