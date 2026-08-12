import { PrismaClient, ListingType } from '@prisma/client';

const prisma = new PrismaClient();

// Fixed ids keep the seed idempotent — re-running updates rows instead of duplicating them.
const OWNER_ID = '11111111-1111-4111-8111-111111111111';
const AGENT_ID = '22222222-2222-4222-8222-222222222222';

// The site owner. Seeded without an authUid: the backend links this row to a
// Supabase identity by email on first sign-in and preserves the ADMIN role, so
// signing in with this Google account grants admin access.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'propertyonset@gmail.com';

const IMAGES = {
  modern:
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=2070',
  villa:
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070',
  loft: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2070',
  condo:
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=2070',
  cabin:
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=2070',
  tower:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
};

type Investment = { roi: number; rentalYield: number; marketTrend: string; description: string };

type Seed = {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  price: number;
  propertyType: string;
  type: ListingType;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  squareFootage: number;
  yearBuilt: number;
  lat: number;
  lng: number;
  neighborhood: string;
  amenities: string[];
  images: string[];
  isFeatured?: boolean;
  furnishing?: string;
  parkingSpaces?: number;
  serviceCharge?: number;
  investment?: Investment;
};

const properties: Seed[] = [
  // ---------- SALE ----------
  {
    id: '33333333-3333-4333-8333-000000000001',
    title: 'Sunlit Victorian in Noe Valley',
    description:
      'A fully restored Victorian with original bay windows, chef kitchen, and a landscaped rear garden. Walkable to 24th Street shops and transit.',
    address: '1428 Elizabeth Street',
    city: 'San Francisco',
    state: 'CA',
    price: 2_395_000,
    propertyType: 'House',
    type: 'SALE',
    bedrooms: 4,
    bathrooms: 3,
    toilets: 4,
    squareFootage: 2680,
    yearBuilt: 1908,
    lat: 37.7509,
    lng: -122.4331,
    neighborhood: 'Noe Valley',
    amenities: ['Garden', 'Fireplace', 'Hardwood Floors', 'Garage', 'Smart Thermostat'],
    images: [IMAGES.villa, IMAGES.modern],
    isFeatured: true,
    parkingSpaces: 2,
  },
  {
    id: '33333333-3333-4333-8333-000000000002',
    title: 'Hillside Modern with Canyon Views',
    description:
      'Glass-walled contemporary cantilevered over the canyon. Open plan living, infinity pool, and a primary suite with panoramic city views.',
    address: '7720 Mulholland Drive',
    city: 'Los Angeles',
    state: 'CA',
    price: 3_150_000,
    propertyType: 'House',
    type: 'SALE',
    bedrooms: 5,
    bathrooms: 4,
    toilets: 5,
    squareFootage: 4120,
    yearBuilt: 2019,
    lat: 34.1259,
    lng: -118.3819,
    neighborhood: 'Hollywood Hills',
    amenities: ['Pool', 'Home Theater', 'Wine Cellar', 'Security System', 'EV Charger'],
    images: [IMAGES.modern, IMAGES.villa],
    isFeatured: true,
    parkingSpaces: 3,
  },
  {
    id: '33333333-3333-4333-8333-000000000003',
    title: 'Craftsman Bungalow near Green Lake',
    description:
      'Classic Seattle craftsman with a covered porch, built-in cabinetry, and a finished basement suitable for a home office or rental.',
    address: '6312 Woodlawn Avenue N',
    city: 'Seattle',
    state: 'WA',
    price: 985_000,
    propertyType: 'House',
    type: 'SALE',
    bedrooms: 3,
    bathrooms: 2,
    toilets: 3,
    squareFootage: 1940,
    yearBuilt: 1926,
    lat: 47.6787,
    lng: -122.3376,
    neighborhood: 'Green Lake',
    amenities: ['Front Porch', 'Basement', 'Fenced Yard', 'Heat Pump'],
    images: [IMAGES.cabin, IMAGES.loft],
    parkingSpaces: 1,
  },
  {
    id: '33333333-3333-4333-8333-000000000004',
    title: 'Waterfront Condo at Coal Harbour',
    description:
      'Corner unit on the 18th floor with floor-to-ceiling glass, wraparound balcony, and unobstructed marina views. Concierge and gym on site.',
    address: '1199 Marinaside Crescent',
    city: 'Vancouver',
    state: 'BC',
    price: 1_680_000,
    propertyType: 'Condo',
    type: 'SALE',
    bedrooms: 2,
    bathrooms: 2,
    toilets: 2,
    squareFootage: 1310,
    yearBuilt: 2015,
    lat: 49.2889,
    lng: -123.1223,
    neighborhood: 'Coal Harbour',
    amenities: ['Concierge', 'Gym', 'Balcony', 'Marina View', 'Storage Locker'],
    images: [IMAGES.tower, IMAGES.condo],
    parkingSpaces: 1,
    serviceCharge: 640,
  },

  // ---------- RENT ----------
  {
    id: '33333333-3333-4333-8333-000000000005',
    title: 'Converted Warehouse Loft in Pearl District',
    description:
      'Timber-beam loft with 14ft ceilings, exposed brick, and a private roof deck. Walk to the streetcar and weekend market.',
    address: '1240 NW Johnson Street',
    city: 'Portland',
    state: 'OR',
    price: 3_200,
    propertyType: 'Loft',
    type: 'RENT',
    bedrooms: 2,
    bathrooms: 2,
    toilets: 2,
    squareFootage: 1450,
    yearBuilt: 1998,
    lat: 45.5299,
    lng: -122.6844,
    neighborhood: 'Pearl District',
    amenities: ['Roof Deck', 'Exposed Brick', 'In-unit Laundry', 'Pet Friendly'],
    images: [IMAGES.loft, IMAGES.modern],
    furnishing: 'Unfurnished',
    parkingSpaces: 1,
  },
  {
    id: '33333333-3333-4333-8333-000000000006',
    title: 'Downtown High-Rise with Skyline Views',
    description:
      'Bright one-bedroom on a high floor with quartz counters, in-unit washer/dryer, and access to a rooftop pool and coworking lounge.',
    address: '360 Nueces Street',
    city: 'Austin',
    state: 'TX',
    price: 2_450,
    propertyType: 'Apartment',
    type: 'RENT',
    bedrooms: 1,
    bathrooms: 1,
    toilets: 1,
    squareFootage: 780,
    yearBuilt: 2021,
    lat: 30.2681,
    lng: -97.7503,
    neighborhood: 'Downtown',
    amenities: ['Rooftop Pool', 'Coworking Lounge', 'Gym', 'Concierge', 'Pet Spa'],
    images: [IMAGES.tower, IMAGES.condo],
    furnishing: 'Unfurnished',
    parkingSpaces: 1,
    serviceCharge: 185,
  },
  {
    id: '33333333-3333-4333-8333-000000000007',
    title: 'Garden Townhome in Capitol Hill',
    description:
      'Three-level townhome with a private patio, updated kitchen, and an attached garage. Quiet street two blocks from the park.',
    address: '1122 Marion Street',
    city: 'Denver',
    state: 'CO',
    price: 2_890,
    propertyType: 'Townhouse',
    type: 'RENT',
    bedrooms: 3,
    bathrooms: 2,
    toilets: 3,
    squareFootage: 1680,
    yearBuilt: 2012,
    lat: 39.7345,
    lng: -104.9782,
    neighborhood: 'Capitol Hill',
    amenities: ['Private Patio', 'Attached Garage', 'Central Air', 'Dishwasher'],
    images: [IMAGES.condo, IMAGES.cabin],
    furnishing: 'Unfurnished',
    parkingSpaces: 2,
  },

  // ---------- SHORTLET ----------
  {
    id: '33333333-3333-4333-8333-000000000008',
    title: 'Beachfront Studio on Ocean Drive',
    description:
      'Fully furnished studio steps from the sand. Nightly and weekly stays, linens and utilities included, self check-in.',
    address: '1455 Ocean Drive',
    city: 'Miami Beach',
    state: 'FL',
    price: 245,
    propertyType: 'Studio',
    type: 'SHORTLET',
    bedrooms: 1,
    bathrooms: 1,
    toilets: 1,
    squareFootage: 520,
    yearBuilt: 2008,
    lat: 25.7857,
    lng: -80.1300,
    neighborhood: 'South Beach',
    amenities: ['Beach Access', 'WiFi', 'Self Check-in', 'Air Conditioning', 'Linens Included'],
    images: [IMAGES.condo, IMAGES.modern],
    furnishing: 'Fully Furnished',
  },
  {
    id: '33333333-3333-4333-8333-000000000009',
    title: 'Alpine Cabin near Heavenly Resort',
    description:
      'Cedar A-frame with a wood stove, hot tub, and ski storage. Sleeps six, ten minutes from the gondola.',
    address: '984 Pine Ridge Road',
    city: 'South Lake Tahoe',
    state: 'CA',
    price: 410,
    propertyType: 'Cabin',
    type: 'SHORTLET',
    bedrooms: 3,
    bathrooms: 2,
    toilets: 3,
    squareFootage: 1560,
    yearBuilt: 1994,
    lat: 38.9399,
    lng: -119.9772,
    neighborhood: 'Heavenly Valley',
    amenities: ['Hot Tub', 'Wood Stove', 'Ski Storage', 'WiFi', 'Mountain View'],
    images: [IMAGES.cabin, IMAGES.villa],
    furnishing: 'Fully Furnished',
    parkingSpaces: 2,
  },

  // ---------- INVESTMENT ----------
  {
    id: '33333333-3333-4333-8333-000000000010',
    title: 'Eight-Unit Multifamily in Midtown',
    description:
      'Stabilized eight-unit building with long-term tenants and below-market rents. Recent roof and HVAC replacement; strong value-add on turnover.',
    address: '2210 Central Avenue',
    city: 'Phoenix',
    state: 'AZ',
    price: 1_850_000,
    propertyType: 'Multifamily',
    type: 'INVESTMENT',
    bedrooms: 16,
    bathrooms: 8,
    toilets: 8,
    squareFootage: 7400,
    yearBuilt: 1986,
    lat: 33.4771,
    lng: -112.0740,
    neighborhood: 'Midtown',
    amenities: ['On-site Laundry', 'Covered Parking', 'Gated Entry'],
    images: [IMAGES.tower, IMAGES.condo],
    isFeatured: true,
    investment: {
      roi: 11.4,
      rentalYield: 7.2,
      marketTrend: 'Rising',
      description:
        'Rents trail market by roughly 18%. Turnover repositioning supports a projected 11.4% unlevered return over a five-year hold.',
    },
  },
  {
    id: '33333333-3333-4333-8333-000000000011',
    title: 'Mixed-Use Retail and Residential Block',
    description:
      'Ground-floor retail with six apartments above on a high-traffic corridor. NNN retail leases in place through 2029.',
    address: '870 Broadway Street',
    city: 'Nashville',
    state: 'TN',
    price: 2_240_000,
    propertyType: 'Mixed-Use',
    type: 'INVESTMENT',
    bedrooms: 12,
    bathrooms: 6,
    toilets: 8,
    squareFootage: 9200,
    yearBuilt: 2004,
    lat: 36.1595,
    lng: -86.7869,
    neighborhood: 'The Gulch',
    amenities: ['Street Frontage', 'NNN Leases', 'Rear Parking', 'Elevator'],
    images: [IMAGES.modern, IMAGES.tower],
    investment: {
      roi: 9.8,
      rentalYield: 6.5,
      marketTrend: 'Stable',
      description:
        'Diversified income across retail and residential. Retail NNN leases run to 2029 with 3% annual escalators.',
    },
  },
  {
    id: '33333333-3333-4333-8333-000000000012',
    title: 'Build-to-Rent Townhome Portfolio',
    description:
      'Portfolio of nine newly built townhomes delivered in 2024, fully leased at delivery. Institutional-quality finishes with a single property manager.',
    address: '4501 Sagebrook Lane',
    city: 'Charlotte',
    state: 'NC',
    price: 3_600_000,
    propertyType: 'Portfolio',
    type: 'INVESTMENT',
    bedrooms: 27,
    bathrooms: 18,
    toilets: 27,
    squareFootage: 15300,
    yearBuilt: 2024,
    lat: 35.2271,
    lng: -80.8431,
    neighborhood: 'Steele Creek',
    amenities: ['New Construction', 'Attached Garages', 'Single Manager', 'Warranty Coverage'],
    images: [IMAGES.villa, IMAGES.cabin],
    investment: {
      roi: 8.9,
      rentalYield: 6.1,
      marketTrend: 'Rising',
      description:
        'New construction limits near-term capex. Charlotte rent growth has outpaced the national average for six consecutive quarters.',
    },
  },
];

async function main() {
  // Upserted by email (the unique key sign-in matches on) rather than id, so this
  // also promotes the account if the owner happened to sign in before seeding.
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'ADMIN' },
    create: {
      email: ADMIN_EMAIL,
      name: 'Property On Set Admin',
      role: 'ADMIN',
    },
  });

  const owner = await prisma.user.upsert({
    where: { id: OWNER_ID },
    update: {},
    create: {
      id: OWNER_ID,
      email: 'agent@propertyonset.dev',
      name: 'Dana Whitfield',
      role: 'AGENT',
      profileImage:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    },
  });

  const agent = await prisma.agent.upsert({
    where: { id: AGENT_ID },
    update: {},
    create: {
      id: AGENT_ID,
      userId: owner.id,
      bio: 'Residential and small-multifamily specialist covering the West Coast and Sun Belt markets.',
      phone: '+1 415 555 0142',
      specialty: 'Residential & Multifamily',
      rating: 4.8,
    },
  });

  // Stagger approvedAt so `orderBy: { approvedAt: 'desc' }` yields a stable, non-arbitrary order.
  const base = Date.now();

  for (const [index, p] of properties.entries()) {
    const approvedAt = new Date(base - index * 60 * 60 * 1000);

    const data = {
      title: p.title,
      description: p.description,
      address: p.address,
      city: p.city,
      state: p.state,
      country: p.state === 'BC' ? 'Canada' : 'United States',
      price: p.price,
      currency: 'USD',
      propertyType: p.propertyType,
      type: p.type,
      // GET /properties filters on PUBLISHED — anything else is invisible to the site.
      status: 'PUBLISHED' as const,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      toilets: p.toilets,
      squareFootage: p.squareFootage,
      squareMeters: Math.round(p.squareFootage * 0.092903),
      furnishing: p.furnishing ?? null,
      parkingSpaces: p.parkingSpaces ?? null,
      yearBuilt: p.yearBuilt,
      // amenities/images are String columns holding JSON; the API parses them on read.
      amenities: JSON.stringify(p.amenities),
      images: JSON.stringify(p.images),
      coverImage: p.images[0],
      lat: p.lat,
      lng: p.lng,
      neighborhood: p.neighborhood,
      serviceCharge: p.serviceCharge ?? null,
      contactPhone: '+1 415 555 0142',
      contactWhatsapp: '+14155550142',
      contactEmail: 'agent@propertyonset.dev',
      isFeatured: p.isFeatured ?? false,
      draftStep: 5,
      lastSavedAt: approvedAt,
      listingViews: Math.floor(Math.random() * 400) + 20,
      ownerId: owner.id,
      agentId: agent.id,
      reviewedById: owner.id,
      approvedAt,
    };

    await prisma.property.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });

    if (p.investment) {
      await prisma.investmentDetail.upsert({
        where: { propertyId: p.id },
        update: p.investment,
        create: { propertyId: p.id, ...p.investment },
      });
    }
  }

  const counts = await prisma.property.groupBy({
    by: ['type'],
    where: { status: 'PUBLISHED' },
    _count: { _all: true },
  });

  console.log('Seed complete. Published listings by type:');
  for (const c of counts) console.log(`  ${c.type.padEnd(11)} ${c._count._all}`);
  console.log(`Admin account: ${admin.email} (role ${admin.role})`);
  console.log('Sign in with that Google account to get admin access.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
