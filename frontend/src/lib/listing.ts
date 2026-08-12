export const AMENITIES = [
  'Kitchen',
  'Balcony',
  'POP ceiling',
  'Swimming pool',
  'Gym',
  'Security',
  'CCTV',
  'Power supply',
  'Water supply',
  'Elevator',
  'Garden',
  'Pet friendly',
  'Wi-Fi',
] as const;

export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Duplex',
  'Land',
  'Commercial',
  'Studio',
] as const;

export const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-furnished', 'Fully furnished'] as const;

export const CURRENCIES = ['USD'] as const;

export type ListingFormData = {
  title: string;
  propertyType: string;
  type: 'SALE' | 'RENT' | 'SHORTLET' | 'INVESTMENT';
  price: string;
  currency: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  squareFootage: string;
  squareMeters: string;
  landSize: string;
  furnishing: string;
  parkingSpaces: string;
  floorNumber: string;
  totalFloors: string;
  yearBuilt: string;
  amenities: string[];
  coverImage: string;
  videoUrl: string;
  tour360Url: string;
  lat: string;
  lng: string;
  landmark: string;
  neighborhood: string;
  estateName: string;
  serviceCharge: string;
  agencyFee: string;
  cautionFee: string;
  inspectionFee: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  draftStep: number;
};

export const emptyListingForm = (): ListingFormData => ({
  title: '',
  propertyType: 'Apartment',
  type: 'SALE',
  price: '',
  currency: 'USD',
  description: '',
  address: '',
  city: '',
  state: '',
  country: 'USA',
  bedrooms: '',
  bathrooms: '',
  toilets: '',
  squareFootage: '',
  squareMeters: '',
  landSize: '',
  furnishing: 'Unfurnished',
  parkingSpaces: '',
  floorNumber: '',
  totalFloors: '',
  yearBuilt: '',
  amenities: [],
  coverImage: '',
  videoUrl: '',
  tour360Url: '',
  lat: '',
  lng: '',
  landmark: '',
  neighborhood: '',
  estateName: '',
  serviceCharge: '',
  agencyFee: '',
  cautionFee: '',
  inspectionFee: '',
  contactPhone: '',
  contactWhatsapp: '',
  contactEmail: '',
  draftStep: 1,
});

export function propertyToForm(p: Record<string, unknown>): ListingFormData {
  const amenities = Array.isArray(p.amenities)
    ? (p.amenities as string[])
    : [];
  return {
    ...emptyListingForm(),
    title: String(p.title ?? ''),
    propertyType: String(p.propertyType ?? 'Apartment'),
    type: (p.type as ListingFormData['type']) ?? 'SALE',
    price: p.price != null ? String(p.price) : '',
    currency: String(p.currency ?? 'USD'),
    description: String(p.description ?? ''),
    address: String(p.address ?? ''),
    city: String(p.city ?? ''),
    state: String(p.state ?? ''),
    country: String(p.country ?? 'USA'),
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
    toilets: p.toilets != null ? String(p.toilets) : '',
    squareFootage: p.squareFootage != null ? String(p.squareFootage) : '',
    squareMeters: p.squareMeters != null ? String(p.squareMeters) : '',
    landSize: p.landSize != null ? String(p.landSize) : '',
    furnishing: String(p.furnishing ?? 'Unfurnished'),
    parkingSpaces: p.parkingSpaces != null ? String(p.parkingSpaces) : '',
    floorNumber: p.floorNumber != null ? String(p.floorNumber) : '',
    totalFloors: p.totalFloors != null ? String(p.totalFloors) : '',
    yearBuilt: p.yearBuilt != null ? String(p.yearBuilt) : '',
    amenities,
    coverImage: String(p.coverImage ?? ''),
    videoUrl: String(p.videoUrl ?? ''),
    tour360Url: String(p.tour360Url ?? ''),
    lat: p.lat != null ? String(p.lat) : '',
    lng: p.lng != null ? String(p.lng) : '',
    landmark: String(p.landmark ?? ''),
    neighborhood: String(p.neighborhood ?? ''),
    estateName: String(p.estateName ?? ''),
    serviceCharge: p.serviceCharge != null ? String(p.serviceCharge) : '',
    agencyFee: p.agencyFee != null ? String(p.agencyFee) : '',
    cautionFee: p.cautionFee != null ? String(p.cautionFee) : '',
    inspectionFee: p.inspectionFee != null ? String(p.inspectionFee) : '',
    contactPhone: String(p.contactPhone ?? ''),
    contactWhatsapp: String(p.contactWhatsapp ?? ''),
    contactEmail: String(p.contactEmail ?? ''),
    draftStep: typeof p.draftStep === 'number' ? p.draftStep : 1,
  };
}
