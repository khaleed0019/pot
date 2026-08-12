'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Map, List, ChevronDown, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import PropertiesMap from '@/components/PropertiesMap';
import { firstImage, useProperties, type ListingType } from '@/lib/useProperties';

/** Shared grid/map browse experience behind /buy, /rent and /shortlet. */
export default function ListingsExplorer({
  type,
  heading,
}: {
  type: ListingType;
  heading: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filters come from the URL so hero/search links and shared URLs both work.
  const cityParam = searchParams.get('city') ?? '';
  const maxPriceParam = searchParams.get('maxPrice') ?? '';
  const [cityInput, setCityInput] = useState(cityParam);

  const { properties, loading, error } = useProperties(type, {
    city: cityParam,
    maxPrice: maxPriceParam,
  });

  const applyCity = () => {
    const next = new URLSearchParams(searchParams.toString());
    if (cityInput.trim()) next.set('city', cityInput.trim());
    else next.delete('city');
    router.push(`?${next.toString()}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Address, City, or Zip Code"
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 border-none font-medium"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyCity();
                }}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
              {['Price', 'Beds & Baths', 'Home Type'].map((label) => (
                <button
                  key={label}
                  className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl font-bold text-secondary hover:bg-gray-50 whitespace-nowrap"
                >
                  <span>{label}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              ))}
              <button className="bg-primary text-white p-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-primary/20">
                <SlidersHorizontal className="h-6 w-6" />
              </button>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-2xl">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-secondary">{heading}</h1>
          <p className="text-gray-500 font-bold">
            {loading ? 'Loading...' : `${properties.length} Results Found`}
          </p>
        </div>

        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

        {viewMode === 'grid' ? (
          loading ? (
            <p className="text-gray-500 font-bold">Loading listings...</p>
          ) : properties.length === 0 && !error ? (
            <p className="text-gray-500 font-bold">No listings available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  title={property.title}
                  price={property.price}
                  address={property.address}
                  city={property.city}
                  state={property.state}
                  beds={property.bedrooms}
                  baths={property.bathrooms}
                  sqft={property.squareFootage}
                  image={firstImage(property.images)}
                  type={property.type}
                />
              ))}
            </div>
          )
        ) : (
          <PropertiesMap properties={properties} loading={loading} error={error} height="600px" />
        )}
      </div>
    </div>
  );
}
