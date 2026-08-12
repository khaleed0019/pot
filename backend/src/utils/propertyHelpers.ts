import { Property, PropertyStatus } from '@prisma/client';

export const PUBLIC_STATUSES: PropertyStatus[] = ['PUBLISHED'];

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(value)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function stringifyJsonArray(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify([value]);
    }
  }
  return '[]';
}

export function formatPropertyResponse(property: Property & Record<string, unknown>) {
  return {
    ...property,
    amenities: parseJsonArray(property.amenities),
    images: parseJsonArray(property.images),
  };
}

export function canViewProperty(
  property: { status: PropertyStatus; ownerId: string },
  user?: { id: string; role: string }
): boolean {
  if (PUBLIC_STATUSES.includes(property.status)) return true;
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return property.ownerId === user.id;
}

export function extractImageUrls(files: Express.Multer.File[] | undefined): string[] {
  if (!files?.length) return [];
  return files
    .map((file) => (file as Express.Multer.File & { path?: string; secure_url?: string; url?: string }).path
      || (file as Express.Multer.File & { secure_url?: string }).secure_url
      || (file as Express.Multer.File & { url?: string }).url
      || file.filename)
    .filter(Boolean) as string[];
}

export function bodyToDraftData(body: Record<string, unknown>, existingImages?: string[]) {
  const num = (v: unknown, fallback?: number) => {
    if (v === undefined || v === null || v === '') return fallback;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isNaN(n) ? fallback : n;
  };
  const int = (v: unknown, fallback?: number) => {
    if (v === undefined || v === null || v === '') return fallback;
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    return Number.isNaN(n) ? fallback : n;
  };

  const data: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value !== undefined) data[key] = value;
  };

  assign('title', body.title);
  assign('description', body.description);
  assign('address', body.address);
  assign('city', body.city);
  assign('state', body.state);
  assign('country', body.country);
  assign('price', num(body.price));
  assign('currency', body.currency);
  assign('propertyType', body.propertyType);
  assign('type', body.type);
  assign('bedrooms', int(body.bedrooms));
  assign('bathrooms', int(body.bathrooms));
  assign('toilets', int(body.toilets));
  assign('squareFootage', num(body.squareFootage));
  assign('squareMeters', num(body.squareMeters));
  assign('landSize', num(body.landSize));
  assign('furnishing', body.furnishing);
  assign('parkingSpaces', int(body.parkingSpaces));
  assign('floorNumber', int(body.floorNumber));
  assign('totalFloors', int(body.totalFloors));
  assign('yearBuilt', int(body.yearBuilt));
  if (body.amenities !== undefined) {
    data.amenities = stringifyJsonArray(body.amenities);
  }
  assign('lat', num(body.lat));
  assign('lng', num(body.lng));
  assign('landmark', body.landmark);
  assign('neighborhood', body.neighborhood);
  assign('estateName', body.estateName);
  assign('serviceCharge', num(body.serviceCharge));
  assign('agencyFee', num(body.agencyFee));
  assign('cautionFee', num(body.cautionFee));
  assign('inspectionFee', num(body.inspectionFee));
  assign('contactPhone', body.contactPhone);
  assign('contactWhatsapp', body.contactWhatsapp);
  assign('contactEmail', body.contactEmail);
  assign('coverImage', body.coverImage);
  assign('videoUrl', body.videoUrl);
  assign('tour360Url', body.tour360Url);
  assign('externalUrl', body.externalUrl);
  assign('draftStep', int(body.draftStep));
  assign('agentId', body.agentId);

  if (existingImages?.length) {
    data.images = JSON.stringify(existingImages);
  } else if (body.images !== undefined) {
    data.images = stringifyJsonArray(body.images);
  }

  return data;
}
