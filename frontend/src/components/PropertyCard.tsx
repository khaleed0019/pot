import { MapPin, Star, Heart } from 'lucide-react';
import Link from 'next/link';
import type { ListingType } from '@/lib/useProperties';

interface PropertyCardProps {
  id: string;
  title: string;
  /** Numeric fields are optional because the API omits them on incomplete listings. */
  price?: number;
  address?: string;
  city?: string;
  state?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  image: string;
  type: ListingType;
}

const TYPE_LABELS: Record<ListingType, string> = {
  SALE: 'For Sale',
  RENT: 'For Rent',
  SHORTLET: 'Shortlet',
  INVESTMENT: 'Investment',
};

const num = (value?: number) => (typeof value === 'number' ? value.toLocaleString() : '—');

const PropertyCard = ({
  id,
  title,
  price,
  address,
  city,
  state,
  beds,
  baths,
  sqft,
  image,
  type,
}: PropertyCardProps) => {
  const location = [address, city, state].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all border border-gray-100">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          {TYPE_LABELS[type] ?? 'For Sale'}
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm">
            <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-2xl font-extrabold text-primary">
            {price != null ? `$${price.toLocaleString()}` : 'Price on request'}
          </p>
          <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="h-4 w-4 fill-current mr-1" />
            <span className="text-sm font-bold">4.8</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-secondary truncate mb-2">{title}</h3>
        <div className="flex items-center text-gray-500 mb-6">
          <MapPin className="h-4 w-4 mr-1 text-primary shrink-0" />
          <span className="truncate">{location || 'Location not provided'}</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-100 pt-6">
          <div className="flex space-x-4">
            <div className="text-center">
              <p className="font-bold text-secondary">{num(beds)}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Beds</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-secondary">{num(baths)}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Baths</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-secondary">{num(sqft)}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Sqft</p>
            </div>
          </div>
          <Link
            href={`/property/${id}`}
            className="bg-accent text-primary px-5 py-2 rounded-xl font-bold hover:bg-primary hover:text-white transition-all transform hover:scale-105"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
