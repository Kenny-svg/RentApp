export const landlords = [
  {
    id: 'l1',
    name: 'Sophia Carter',
    rating: 4.8,
    reviewsCount: 41,
    propertiesCount: 4,
    phone: '+1 (555) 201-4920',
    email: 'sophia@rentrate.com',
    bio: 'Responsive landlord focused on maintenance, clear communication, and long-term tenant satisfaction.'
  },
  {
    id: 'l2',
    name: 'Marcus Bennett',
    rating: 4.5,
    reviewsCount: 33,
    propertiesCount: 3,
    phone: '+1 (555) 903-1882',
    email: 'marcus@rentrate.com',
    bio: 'Offers modern apartments with transparent lease terms and fair rent adjustments.'
  },
  {
    id: 'l3',
    name: 'Ava Thompson',
    rating: 4.9,
    reviewsCount: 57,
    propertiesCount: 6,
    phone: '+1 (555) 332-1189',
    email: 'ava@rentrate.com',
    bio: 'Known for fast issue resolution, quality property care, and thoughtful tenant onboarding.'
  }
];

export const tenants = [
  { id: 't1', name: 'Daniel Lee', email: 'daniel@example.com' },
  { id: 't2', name: 'Maya Johnson', email: 'maya@example.com' },
  { id: 't3', name: 'Noah Brooks', email: 'noah@example.com' }
];

export const properties = [
  {
    id: 'p1',
    title: 'Riverside Loft Apartment',
    location: 'Austin, TX',
    price: 2200,
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    landlordId: 'l1',
    propertyRating: 4.7,
    availability: 'Available',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Bright loft with skyline views, open kitchen, and secure parking in a walkable neighborhood.',
    amenities: ['Gym', 'Covered Parking', 'High-Speed Internet', 'Pet Friendly']
  },
  {
    id: 'p2',
    title: 'Greenwood Family Home',
    location: 'Seattle, WA',
    price: 3100,
    type: 'House',
    bedrooms: 3,
    bathrooms: 2,
    landlordId: 'l2',
    propertyRating: 4.5,
    availability: 'Available',
    image:
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Spacious home with private backyard, updated kitchen, and excellent school access.',
    amenities: ['Backyard', 'Washer/Dryer', 'Storage', 'Smart Thermostat']
  },
  {
    id: 'p3',
    title: 'Downtown Studio Residence',
    location: 'Chicago, IL',
    price: 1650,
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    landlordId: 'l1',
    propertyRating: 4.4,
    availability: 'Occupied',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Modern studio designed for city living with concierge and rooftop lounge access.',
    amenities: ['Concierge', 'Rooftop Deck', 'Bike Storage', 'Security Access']
  },
  {
    id: 'p4',
    title: 'Maple Heights Duplex',
    location: 'Denver, CO',
    price: 2400,
    type: 'Duplex',
    bedrooms: 2,
    bathrooms: 2,
    landlordId: 'l3',
    propertyRating: 4.9,
    availability: 'Available',
    image:
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566752227-8f3b0a8f7b8f?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Premium duplex with mountain views, large balcony, and newly renovated interiors.',
    amenities: ['Balcony', 'Fireplace', 'Garage', 'Air Conditioning']
  }
];

export const reviews = [
  {
    id: 'r1',
    propertyId: 'p1',
    landlordId: 'l1',
    tenantId: 't1',
    tenantName: 'Daniel Lee',
    landlordRating: 5,
    propertyRating: 4.8,
    maintenanceQuality: 5,
    communication: 5,
    propertyCondition: 4,
    rentFairness: 4,
    recommend: true,
    comment: 'Maintenance requests are handled quickly and the apartment is always kept in great condition.',
    date: '2026-03-10'
  },
  {
    id: 'r2',
    propertyId: 'p2',
    landlordId: 'l2',
    tenantId: 't2',
    tenantName: 'Maya Johnson',
    landlordRating: 4,
    propertyRating: 4.3,
    maintenanceQuality: 4,
    communication: 4,
    propertyCondition: 4,
    rentFairness: 4,
    recommend: true,
    comment: 'Great communication and clean property with a fair rental process.',
    date: '2026-02-21'
  },
  {
    id: 'r3',
    propertyId: 'p4',
    landlordId: 'l3',
    tenantId: 't3',
    tenantName: 'Noah Brooks',
    landlordRating: 5,
    propertyRating: 5,
    maintenanceQuality: 5,
    communication: 5,
    propertyCondition: 5,
    rentFairness: 5,
    recommend: true,
    comment: 'Best rental experience so far. Clear lease terms and excellent upkeep.',
    date: '2026-04-08'
  }
];

export const testimonials = [
  {
    id: 'tm1',
    name: 'Kelsey Morgan',
    role: 'Tenant',
    text: 'RentRate helped me avoid bad rentals and choose a landlord with real trust signals.'
  },
  {
    id: 'tm2',
    name: 'Ethan Park',
    role: 'Landlord',
    text: 'Our profile ratings improved occupancy and attracted serious renters fast.'
  },
  {
    id: 'tm3',
    name: 'Rachel Cruz',
    role: 'Tenant',
    text: 'The review system is transparent and makes apartment hunting less stressful.'
  }
];
