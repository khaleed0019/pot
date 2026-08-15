/**
 * Bulk-generates realistic (but synthetic) SALE and RENT listings across many
 * US markets, so the site looks fully populated without scraping/republishing
 * real people's real listings, addresses, or copyrighted photos.
 *
 * Pricing is grounded in each city's real relative market tier (a rough
 * $/sqft band per tier), not arbitrary — a Cleveland listing and a San
 * Francisco listing of the same size land in believably different price
 * ranges. Photos are drawn from small exterior/interior pools per listing.
 *
 * Idempotent: every listing gets a deterministic UUID derived from its index,
 * so re-running upserts instead of duplicating.
 *
 * Run with: npm run seed:listings
 */
import { PrismaClient, type ListingType } from '@prisma/client';

const prisma = new PrismaClient();

// Deterministic PRNG (mulberry32) so re-running produces the exact same
// listings instead of a new random set each time.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260815);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1));

type Tier = 'ultra' | 'high' | 'mid' | 'affordable';

type City = { city: string; state: string; lat: number; lng: number; tier: Tier };

const CITIES: City[] = [
  // ultra
  { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, tier: 'ultra' },
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.006, tier: 'ultra' },
  { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, tier: 'ultra' },
  { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, tier: 'ultra' },
  // high
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, tier: 'high' },
  { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, tier: 'high' },
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, tier: 'high' },
  { city: 'Washington', state: 'DC', lat: 38.9072, lng: -77.0369, tier: 'high' },
  { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, tier: 'high' },
  { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, tier: 'high' },
  // mid
  { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, tier: 'mid' },
  { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784, tier: 'mid' },
  { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, tier: 'mid' },
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, tier: 'mid' },
  { city: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388, tier: 'mid' },
  { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431, tier: 'mid' },
  { city: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382, tier: 'mid' },
  { city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.265, tier: 'mid' },
  { city: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944, tier: 'mid' },
  { city: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.891, tier: 'mid' },
  { city: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572, tier: 'mid' },
  { city: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792, tier: 'mid' },
  { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074, tier: 'mid' },
  { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.797, tier: 'mid' },
  { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, tier: 'mid' },
  // affordable
  { city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988, tier: 'affordable' },
  { city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581, tier: 'affordable' },
  { city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, tier: 'affordable' },
  { city: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959, tier: 'affordable' },
  { city: 'Cincinnati', state: 'OH', lat: 39.1031, lng: -84.512, tier: 'affordable' },
  { city: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944, tier: 'affordable' },
  { city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585, tier: 'affordable' },
  { city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.049, tier: 'affordable' },
  { city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458, tier: 'affordable' },
  { city: 'St. Louis', state: 'MO', lat: 38.627, lng: -90.1994, tier: 'affordable' },
  { city: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065, tier: 'affordable' },
  { city: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, tier: 'affordable' },
  { city: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164, tier: 'affordable' },
  { city: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504, tier: 'affordable' },
  { city: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747, tier: 'affordable' },
];

// Rough $/sqft bands per tier — sale is a one-time price, rent is monthly.
const SALE_PSF: Record<Tier, [number, number]> = {
  ultra: [650, 1050],
  high: [380, 560],
  mid: [230, 340],
  affordable: [120, 210],
};
const RENT_PSF: Record<Tier, [number, number]> = {
  ultra: [4.5, 6.5],
  high: [2.4, 3.6],
  mid: [1.5, 2.2],
  affordable: [0.85, 1.35],
};

const STREET_NAMES = [
  'Maple', 'Oak', 'Cedar', 'Elm', 'Birch', 'Willow', 'Magnolia', 'Sycamore',
  'Highland', 'Sunset', 'Ridge', 'Meadow', 'Lakeview', 'Riverside', 'Hillcrest',
  'Prairie', 'Orchard', 'Chestnut', 'Aspen', 'Fairview', 'Pinehurst', 'Brookside',
  'Summit', 'Vista', 'Cascade', 'Harbor', 'Foxglove', 'Juniper', 'Laurel', 'Windsor',
] as const;
const STREET_TYPES = ['St', 'Ave', 'Dr', 'Ln', 'Ct', 'Way', 'Blvd', 'Ter'] as const;
const NEIGHBORHOODS = [
  'Midtown', 'Uptown', 'Old Town', 'Riverside', 'The Heights', 'West End',
  'Eastgate', 'North Park', 'Southside', 'Downtown', 'Lakeside', 'Hillside',
] as const;

const SALE_TYPES = ['House', 'Townhouse', 'Condo', 'Duplex'] as const;
const RENT_TYPES = ['Apartment', 'Condo', 'Townhouse', 'House', 'Studio'] as const;

const AMENITY_POOL = [
  'Central Air', 'Hardwood Floors', 'In-unit Laundry', 'Dishwasher', 'Garage',
  'Fenced Yard', 'Balcony', 'Pet Friendly', 'Gym', 'Pool', 'Walk-in Closet',
  'Updated Kitchen', 'Fireplace', 'Smart Thermostat', 'Storage Unit', 'EV Charger',
] as const;

const EXTERIOR_PHOTOS = [
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1523192193543-6e7296d960e4?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=2070', // existing IMAGES.modern
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070', // existing IMAGES.tower
];
const APARTMENT_EXTERIOR_PHOTOS = [
  'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
];
const INTERIOR_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070', // existing IMAGES.villa
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2070', // existing IMAGES.loft
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=2070', // existing IMAGES.condo
];

const AGENTS = [
  // Same person/email/id as the original seed.ts owner — reused rather than
  // duplicated, since a User.email collision under a different id would fail.
  { id: '11111111-1111-4111-8111-111111111111', name: 'Dana Whitfield', email: 'agent@propertyonset.dev', phone: '+1 415 555 0142', specialty: 'Residential & Multifamily' },
  { id: '44444444-4444-4444-8444-000000000002', name: 'Marcus Ibe', email: 'marcus.ibe@propertyonset.dev', phone: '+1 312 555 0198', specialty: 'Urban Condos & Lofts' },
  { id: '44444444-4444-4444-8444-000000000003', name: 'Sofia Reyes', email: 'sofia.reyes@propertyonset.dev', phone: '+1 512 555 0173', specialty: 'Suburban Family Homes' },
  { id: '44444444-4444-4444-8444-000000000004', name: 'Jalen Carter', email: 'jalen.carter@propertyonset.dev', phone: '+1 216 555 0161', specialty: 'Rentals & Property Management' },
] as const;

function titleFor(type: 'SALE' | 'RENT', propertyType: string, neighborhood: string): string {
  const saleAdjectives = ['Charming', 'Updated', 'Spacious', 'Classic', 'Sunlit', 'Move-in Ready', 'Renovated'];
  const rentAdjectives = ['Bright', 'Cozy', 'Modern', 'Well-kept', 'Convenient', 'Newly Renovated'];
  const adj = pick(type === 'SALE' ? saleAdjectives : rentAdjectives);
  return `${adj} ${propertyType} in ${neighborhood}`;
}

function descriptionFor(type: 'SALE' | 'RENT', propertyType: string, city: string, beds: number): string {
  if (type === 'SALE') {
    return `A ${beds}-bedroom ${propertyType.toLowerCase()} in one of ${city}'s established neighborhoods, close to schools, parks, and everyday shopping. Updated finishes throughout with room to make it your own.`;
  }
  return `A well-maintained ${beds === 0 ? 'studio' : `${beds}-bedroom`} ${propertyType.toLowerCase()} in ${city}, walking distance to transit and local restaurants. Available now, on-site management.`;
}

async function ensureAgents() {
  for (const a of AGENTS) {
    const user = await prisma.user.upsert({
      where: { id: a.id },
      update: {},
      create: { id: a.id, email: a.email, name: a.name, role: 'AGENT' },
    });
    await prisma.agent.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, phone: a.phone, specialty: a.specialty, rating: 4.5 + rand() * 0.5 },
    });
  }
  // Agent.id is its own auto-generated PK, distinct from the User ids in AGENTS —
  // look these up by userId, which is what we actually control here.
  return prisma.agent.findMany({ where: { userId: { in: AGENTS.map((a) => a.id) } } });
}

async function main() {
  const agents = await ensureAgents();
  const base = Date.now();
  let created = 0;

  const jobs: { seq: number; type: 'SALE' | 'RENT' }[] = [
    ...Array.from({ length: 50 }, (_, i) => ({ seq: i, type: 'SALE' as const })),
    ...Array.from({ length: 100 }, (_, i) => ({ seq: i, type: 'RENT' as const })),
  ];

  for (const job of jobs) {
    const idSuffix = job.type === 'SALE' ? 'a' : 'b';
    const id = `55555555-5555-4555-8555-${idSuffix}${String(job.seq).padStart(11, '0')}`;

    const loc = pick(CITIES);
    const propertyType = pick(job.type === 'SALE' ? SALE_TYPES : RENT_TYPES);
    const neighborhood = pick(NEIGHBORHOODS);
    const street = `${int(100, 9899)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;

    const sqft =
      job.type === 'SALE'
        ? int(850, 4200)
        : propertyType === 'Studio'
          ? int(380, 600)
          : int(550, 1800);

    const bedrooms =
      propertyType === 'Studio' ? 0 : job.type === 'SALE' ? int(2, 5) : int(1, 3);
    const bathrooms = Math.max(1, Math.round(bedrooms * (0.6 + rand() * 0.5)));

    const [psfMin, psfMax] = (job.type === 'SALE' ? SALE_PSF : RENT_PSF)[loc.tier];
    const psf = psfMin + rand() * (psfMax - psfMin);
    const rawPrice = sqft * psf;
    // Round sale prices to the nearest $1k, rent to the nearest $25.
    const price = job.type === 'SALE' ? Math.round(rawPrice / 1000) * 1000 : Math.round(rawPrice / 25) * 25;

    const agent = pick(agents);
    const exteriorPool = propertyType === 'Apartment' || propertyType === 'Studio' ? APARTMENT_EXTERIOR_PHOTOS : EXTERIOR_PHOTOS;
    const images = [pick(exteriorPool), pick(INTERIOR_PHOTOS)];
    const amenities = Array.from({ length: int(3, 6) }, () => pick(AMENITY_POOL)).filter(
      (v, i, arr) => arr.indexOf(v) === i,
    );

    const approvedAt = new Date(base - (job.seq + (job.type === 'RENT' ? 1000 : 0)) * 45 * 60 * 1000);

    const data = {
      title: titleFor(job.type, propertyType, neighborhood),
      description: descriptionFor(job.type, propertyType, loc.city, bedrooms),
      address: street,
      city: loc.city,
      state: loc.state,
      country: 'United States',
      price,
      currency: 'USD',
      propertyType,
      type: job.type as ListingType,
      status: 'PUBLISHED' as const,
      bedrooms,
      bathrooms,
      toilets: bathrooms,
      squareFootage: sqft,
      squareMeters: Math.round(sqft * 0.092903),
      furnishing: job.type === 'RENT' ? pick(['Unfurnished', 'Semi-furnished'] as const) : null,
      parkingSpaces: int(0, 2),
      yearBuilt: int(1955, 2024),
      amenities: JSON.stringify(amenities),
      images: JSON.stringify(images),
      coverImage: images[0],
      lat: loc.lat + (rand() - 0.5) * 0.12,
      lng: loc.lng + (rand() - 0.5) * 0.12,
      neighborhood,
      contactPhone: agent.phone,
      contactWhatsapp: agent.phone?.replace(/\s+/g, ''),
      contactEmail: AGENTS.find((a) => a.id === agent.userId)?.email,
      isFeatured: rand() < 0.08,
      draftStep: 5,
      lastSavedAt: approvedAt,
      listingViews: int(5, 350),
      ownerId: agent.userId,
      agentId: agent.id,
      reviewedById: agent.userId,
      approvedAt,
    };

    await prisma.property.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    created += 1;
  }

  const counts = await prisma.property.groupBy({
    by: ['type'],
    where: { status: 'PUBLISHED' },
    _count: { _all: true },
  });

  console.log(`Seeded/updated ${created} listings.`);
  console.log('Published listings by type:');
  for (const c of counts) console.log(`  ${c.type.padEnd(11)} ${c._count._all}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
