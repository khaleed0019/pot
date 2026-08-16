'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Map, List, ChevronDown, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import PropertiesMap from '@/components/PropertiesMap';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PROPERTY_TYPES } from '@/lib/listing';
import { firstImage, useProperties, type ListingType } from '@/lib/useProperties';

/**
 * `bedrooms`/`bathrooms` match exactly on the server, so these are exact counts
 * rather than the "3+" style used by some listing sites.
 */
const ROOM_COUNTS = ['1', '2', '3', '4', '5'] as const;

/** Compact price for the trigger label: 500000 -> "500K". */
function formatPrice(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    amount,
  );
}

/** Dropdown shell: label + chevron trigger, click-outside/Escape to dismiss. */
function FilterPopover({
  label,
  summary,
  children,
}: {
  label: string;
  /** Set when the filter is active — replaces the label and highlights the trigger. */
  summary?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const active = Boolean(summary);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center space-x-2 border px-4 py-3 rounded-2xl font-bold whitespace-nowrap ${
          active
            ? 'bg-primary/5 border-primary text-primary'
            : 'bg-white border-gray-200 text-secondary hover:bg-gray-50'
        }`}
      >
        <span>{summary || label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Mounted only while open, so drafts reset to the current URL on each visit. */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** Min/max price draft, committed on Apply rather than on every keystroke. */
function PriceFields({
  minPrice,
  maxPrice,
  onApply,
}: {
  minPrice: string;
  maxPrice: string;
  onApply: (next: { minPrice: string; maxPrice: string }) => void;
}) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  const fieldClass =
    'w-full px-3 py-2 bg-gray-100 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onApply({ minPrice: min.trim(), maxPrice: max.trim() });
      }}
    >
      <p className="font-bold text-secondary mb-3">Price range ($)</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          placeholder="No min"
          aria-label="Minimum price"
          className={fieldClass}
          value={min}
          onChange={(event) => setMin(event.target.value)}
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min="0"
          placeholder="No max"
          aria-label="Maximum price"
          className={fieldClass}
          value={max}
          onChange={(event) => setMax(event.target.value)}
        />
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => onApply({ minPrice: '', maxPrice: '' })}
          className="text-sm font-bold text-gray-500 hover:text-secondary"
        >
          Clear
        </button>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </form>
  );
}

/** Radio-style list of choices, with an "Any" entry that clears the filter. */
function OptionRow({
  options,
  value,
  onSelect,
}: {
  options: readonly string[];
  value: string;
  onSelect: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {['', ...options].map((option) => (
        <button
          key={option || 'any'}
          type="button"
          aria-pressed={value === option}
          onClick={() => onSelect(option)}
          className={`px-3 py-2 rounded-xl text-sm font-bold border ${
            value === option
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-secondary border-gray-200 hover:bg-gray-50'
          }`}
        >
          {option || 'Any'}
        </button>
      ))}
    </div>
  );
}

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
  const minPriceParam = searchParams.get('minPrice') ?? '';
  const maxPriceParam = searchParams.get('maxPrice') ?? '';
  const bedroomsParam = searchParams.get('bedrooms') ?? '';
  const bathroomsParam = searchParams.get('bathrooms') ?? '';
  const propertyTypeParam = searchParams.get('propertyType') ?? '';
  const [cityInput, setCityInput] = useState(cityParam);

  const { properties, loading, error } = useProperties(type, {
    city: cityParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    bedrooms: bedroomsParam,
    bathrooms: bathroomsParam,
    propertyType: propertyTypeParam,
  });

  /** Filters live in the URL, so results stay shareable and the back button works. */
  const applyParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.push(`?${next.toString()}`);
  };

  const applyCity = () => applyParams({ city: cityInput.trim() });

  const priceSummary =
    minPriceParam && maxPriceParam
      ? `$${formatPrice(minPriceParam)} – $${formatPrice(maxPriceParam)}`
      : minPriceParam
        ? `$${formatPrice(minPriceParam)}+`
        : maxPriceParam
          ? `Up to $${formatPrice(maxPriceParam)}`
          : '';

  const roomSummary = [
    bedroomsParam && `${bedroomsParam} bd`,
    bathroomsParam && `${bathroomsParam} ba`,
  ]
    .filter(Boolean)
    .join(' · ');

  const hasFilters = Boolean(priceSummary || roomSummary || propertyTypeParam);

  // propertyType is free text, so older listings can hold values the wizard's picker
  // no longer offers ("Condo"). Fold in what the current results use plus the active
  // selection, otherwise those listings would be unreachable from this dropdown.
  const homeTypeOptions = Array.from(
    new Set([
      ...PROPERTY_TYPES,
      ...properties.flatMap((property) => (property.propertyType ? [property.propertyType] : [])),
      ...(propertyTypeParam ? [propertyTypeParam] : []),
    ]),
  ).sort();

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
              <FilterPopover label="Price" summary={priceSummary}>
                {(close) => (
                  <PriceFields
                    minPrice={minPriceParam}
                    maxPrice={maxPriceParam}
                    onApply={(next) => {
                      applyParams(next);
                      close();
                    }}
                  />
                )}
              </FilterPopover>

              <FilterPopover label="Beds & Baths" summary={roomSummary}>
                {() => (
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-secondary mb-2">Bedrooms</p>
                      <OptionRow
                        options={ROOM_COUNTS}
                        value={bedroomsParam}
                        onSelect={(next) => applyParams({ bedrooms: next })}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-secondary mb-2">Bathrooms</p>
                      <OptionRow
                        options={ROOM_COUNTS}
                        value={bathroomsParam}
                        onSelect={(next) => applyParams({ bathrooms: next })}
                      />
                    </div>
                  </div>
                )}
              </FilterPopover>

              <FilterPopover label="Home Type" summary={propertyTypeParam}>
                {(close) => (
                  <OptionRow
                    options={homeTypeOptions}
                    value={propertyTypeParam}
                    onSelect={(next) => {
                      applyParams({ propertyType: next });
                      close();
                    }}
                  />
                )}
              </FilterPopover>

              {hasFilters && (
                <button
                  type="button"
                  onClick={() =>
                    applyParams({
                      minPrice: '',
                      maxPrice: '',
                      bedrooms: '',
                      bathrooms: '',
                      propertyType: '',
                    })
                  }
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-3 rounded-2xl font-bold whitespace-nowrap hover:bg-blue-700 shadow-lg shadow-primary/20"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Clear</span>
                </button>
              )}
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
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: heading }]} />
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
