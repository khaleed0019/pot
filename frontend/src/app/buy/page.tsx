import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import ListingsExplorer from '@/components/ListingsExplorer';
import { StaggerGrid, StaggerItem } from '@/components/motion/StaggerGrid';

export const metadata: Metadata = {
  title: 'Homes for Sale',
  description: 'Browse homes for sale across the USA — filter by price, beds, baths, and home type, or explore listings on the map.',
};

const TESTIMONIALS = [
  {
    name: 'Sam T.',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
    homeLabel: 'Closed in 34 days',
    quote:
      "We'd been priced out twice before. The map search let us catch a new listing the morning it went up, and our agent had an offer in by that afternoon.",
  },
  {
    name: 'Jordan L.',
    location: 'Raleigh, NC',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200&h=200',
    homeLabel: 'First-time buyer',
    quote:
      'The mortgage calculator on the listing page saved us from lowballing our own budget. We ended up in a better neighborhood than we thought we could afford.',
  },
  {
    name: 'Maya P.',
    location: 'Sacramento, CA',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=200&h=200',
    homeLabel: 'Upsized for a growing family',
    quote:
      "Filtering by bedrooms and school-adjacent neighborhoods got our list down to six houses in a weekend. We toured three and had an accepted offer within the week.",
  },
  {
    name: 'Chris B.',
    location: 'Tampa, FL',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200',
    homeLabel: 'Relocated for work',
    quote:
      'I was house hunting from out of state. Being able to see everything on the map and message the agent directly made the whole thing feel a lot less risky.',
  },
] as const;

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading listings...</div>}>
      <ListingsExplorer type="SALE" heading="Homes for Sale" />

      {/* Buyer Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-secondary mb-6">
              What Our Buyers Say
            </h2>
            <p className="text-xl text-gray-500">
              Thousands of closed deals. Real homes, real families.
            </p>
          </div>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TESTIMONIALS.map((t) => (
              <StaggerItem
                key={t.name}
                className="bg-gray-50 rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <p className="font-extrabold text-secondary">{t.name}</p>
                    <p className="text-sm text-gray-400 font-medium">{t.location}</p>
                  </div>
                </div>

                <span className="self-start bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-6">
                  {t.homeLabel}
                </span>

                <p className="text-gray-600 italic leading-relaxed mb-6 flex-1">&ldquo;{t.quote}&rdquo;</p>

                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>
    </Suspense>
  );
}
