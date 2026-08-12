import prisma from './prisma.js';
import { parseJsonArray } from './propertyHelpers.js';

const COORD_THRESHOLD = 0.0005;

export interface DuplicateMatch {
  id: string;
  title: string;
  address: string;
  price: number;
  status: string;
  reasons: string[];
}

export async function findDuplicateListings(
  input: {
    id?: string;
    title?: string;
    address?: string;
    price?: number;
    lat?: number | null;
    lng?: number | null;
    images?: string[];
  }
): Promise<DuplicateMatch[]> {
  const candidates = await prisma.property.findMany({
    where: {
      ...(input.id ? { NOT: { id: input.id } } : {}),
      status: { in: ['DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED'] },
    },
    select: {
      id: true,
      title: true,
      address: true,
      price: true,
      status: true,
      lat: true,
      lng: true,
      images: true,
    },
    take: 200,
  });

  const matches: DuplicateMatch[] = [];

  for (const c of candidates) {
    const reasons: string[] = [];
    if (input.title && c.title.trim().toLowerCase() === input.title.trim().toLowerCase()) {
      reasons.push('same_title');
    }
    if (input.address && c.address.trim().toLowerCase() === input.address.trim().toLowerCase()) {
      reasons.push('same_address');
    }
    if (input.price !== undefined && c.price === input.price) {
      reasons.push('same_price');
    }
    if (
      input.lat != null &&
      input.lng != null &&
      c.lat != null &&
      c.lng != null &&
      Math.abs(c.lat - input.lat) < COORD_THRESHOLD &&
      Math.abs(c.lng - input.lng) < COORD_THRESHOLD
    ) {
      reasons.push('same_coordinates');
    }
    const existingImages = parseJsonArray(c.images);
    const newImages = input.images || [];
    if (newImages.length && existingImages.length) {
      const overlap = newImages.filter((img) => existingImages.includes(img));
      if (overlap.length > 0) reasons.push('similar_images');
    }
    if (reasons.length) {
      matches.push({
        id: c.id,
        title: c.title,
        address: c.address,
        price: c.price,
        status: c.status,
        reasons,
      });
    }
  }

  return matches;
}
