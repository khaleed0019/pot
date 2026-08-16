'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, DollarSign, PieChart, Activity, MapPin, ChevronRight, Star, Map, List } from 'lucide-react';
import PropertiesMap from '@/components/PropertiesMap';
import Breadcrumbs from '@/components/Breadcrumbs';
import { firstImage, useProperties } from '@/lib/useProperties';

const TESTIMONIALS = [
  {
    name: 'Marcus R.',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    portfolioValue: '$340,000',
    returnLabel: '+14.2% appreciation',
    quote:
      "Bought my first duplex through Property On Set two years ago. The rental yield data was spot on, and I've since added two more units to my portfolio.",
  },
  {
    name: 'Priya N.',
    location: 'Charlotte, NC',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    portfolioValue: '$98,500',
    returnLabel: '+11.8% return',
    quote:
      "The build-to-rent listing paid for itself faster than my advisor projected. Now I check the map for new listings every week.",
  },
  {
    name: 'Devon K.',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    portfolioValue: '$212,000',
    returnLabel: '+6.1% cash-on-cash',
    quote:
      'Turnkey management made this my first hands-off rental. Property On Set handled everything from due diligence to close.',
  },
  {
    name: 'Elena F.',
    location: 'Nashville, TN',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    portfolioValue: '$156,000',
    returnLabel: '+9.4% rental yield',
    quote:
      'Diversified out of my 401k into two mixed-use properties. The market trend reports made the decision easy.',
  },
] as const;

export default function InvestPageContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { properties, loading, error } = useProperties('INVESTMENT');

  return (
    <div className="bg-white min-h-screen">
      {/* Investment Hero */}
      <section className="bg-secondary py-24 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Activity className="w-full h-full text-white" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <div className="inline-flex items-center space-x-2 bg-primary/20 text-primary border border-primary/30 px-6 py-2 rounded-full mb-8">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-bold uppercase tracking-widest">Real Estate Investment Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight max-w-4xl mx-auto">
            Build Wealth with Premium Real Estate Assets
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Invest in high-performing residential and commercial properties with verified ROI and market growth data.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/20">
              Start Investing
            </button>
            <button className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
              Download Market Report
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Volume', value: '$450M+', icon: DollarSign, color: 'text-blue-500' },
              { label: 'Average ROI', value: '11.4%', icon: TrendingUp, color: 'text-green-500' },
              { label: 'Investors', value: '12,500+', icon: Activity, color: 'text-purple-500' },
              { label: 'Asset Classes', value: '15+', icon: PieChart, color: 'text-orange-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-[32px] p-8 shadow-2xl border border-gray-100 flex items-center space-x-6">
                <div className={`${stat.color} bg-gray-50 p-4 rounded-2xl`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-secondary">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Listings */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Invest' }]} />
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-extrabold text-secondary">Investment Opportunities</h2>
              <p className="text-gray-500 mt-2">Verified high-growth properties for your portfolio.</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl flex items-center space-x-2 px-4 font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                }`}
              >
                <List className="h-5 w-5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-xl flex items-center space-x-2 px-4 font-bold transition-all ${
                  viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                }`}
              >
                <Map className="h-5 w-5" />
                <span>Map</span>
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 font-bold">Loading investment properties...</p>
          ) : error ? (
            <p className="text-red-500 font-semibold">{error}</p>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {properties.length ? (
                properties.map((prop) => {
                  const imageUrl = firstImage(prop.images);
                  const roi = prop.investmentData?.roi;
                  const rentalYield = prop.investmentData?.rentalYield;
                  const marketTrend = prop.investmentData?.marketTrend;

                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-gray-100 group hover:shadow-2xl transition-all flex flex-col h-full"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-bold text-green-600">
                            {roi != null ? `${roi}%` : 'N/A'} Projected ROI
                          </span>
                        </div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex items-center text-gray-500 mb-4">
                          <MapPin className="h-4 w-4 mr-1 text-primary" />
                          <span className="text-sm font-bold uppercase tracking-widest">
                            {prop.city || prop.address}
                          </span>
                        </div>

                        <h3 className="text-2xl font-extrabold text-secondary mb-6 group-hover:text-primary transition-colors leading-tight">
                          {prop.title}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                              Rental Yield
                            </p>
                            <p className="text-xl font-extrabold text-secondary">
                              {rentalYield != null ? `${rentalYield}%` : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                              Market Growth
                            </p>
                            <p className="text-xl font-extrabold text-green-600">
                              {marketTrend || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                              Investment Starting at
                            </p>
                            <p className="text-2xl font-extrabold text-primary">
                              ${Number(prop.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <Link
                            href={`/property/${prop.id}`}
                            className="bg-accent p-4 rounded-2xl text-primary hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 font-bold">No investment listings yet.</p>
              )}
            </div>
          ) : (
            <PropertiesMap
              properties={properties}
              loading={loading}
              error={error}
              height="600px"
              variant="roi"
            />
          )}
        </div>
      </section>

      {/* Market Trends Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="relative bg-white rounded-[50px] p-10 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="text-2xl font-extrabold text-secondary">Market Performance</h4>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="space-y-8">
                  {[
                    { city: 'Miami, FL', yield: '8.4%', trend: 'Upward', color: 'bg-green-100 text-green-600' },
                    { city: 'Austin, TX', yield: '7.2%', trend: 'Stable', color: 'bg-blue-100 text-blue-600' },
                    { city: 'Phoenix, AZ', yield: '9.1%', trend: 'Strong', color: 'bg-purple-100 text-purple-600' },
                    { city: 'Toronto, ON', yield: '5.8%', trend: 'Upward', color: 'bg-orange-100 text-orange-600' },
                  ].map((city, i) => (
                    <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${city.color}`}>
                          <Activity className="h-5 w-5" />
                        </div>
                        <p className="text-lg font-bold text-secondary">{city.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-secondary">{city.yield}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{city.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-secondary mb-8 leading-tight">
                Data-Driven Decisions for Modern Investors
              </h2>
              <p className="text-xl text-gray-500 mb-10 leading-relaxed">
                We analyze millions of data points across North America to bring you the most promising investment opportunities. Our platform combines historical trends, current market data, and future projections to minimize risk.
              </p>
              <ul className="space-y-6 mb-12">
                {[
                  'Predictive Market Analysis',
                  'Verified Rental History',
                  'Tax Efficiency Reports',
                  'Turnkey Management Services'
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Star className="h-5 w-5 text-primary fill-current" />
                    </div>
                    <span className="text-lg font-bold text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-secondary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                Join our Investor Network
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Investor Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-secondary mb-6">
              What Our Investors Say
            </h2>
            <p className="text-xl text-gray-500">
              12,500+ active investors. Real portfolios, real returns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 flex flex-col"
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

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xl font-extrabold text-primary">{t.portfolioValue}</span>
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full">
                    {t.returnLabel}
                  </span>
                </div>

                <p className="text-gray-600 italic leading-relaxed mb-6 flex-1">&ldquo;{t.quote}&rdquo;</p>

                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
