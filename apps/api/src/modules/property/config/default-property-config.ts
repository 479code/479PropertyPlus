/** Default property configuration seeded into every new organization. */

export const DEFAULT_PROPERTY_TYPES = [
  'Residential',
  'Commercial',
  'Office',
  'Warehouse',
  'Industrial',
  'Mixed Use',
  'Land',
  'Hotel',
  'Estate',
  'Apartment',
];

export const DEFAULT_PROPERTY_STATUSES: Array<{ name: string; color: string }> = [
  { name: 'Active', color: '#16a34a' },
  { name: 'Inactive', color: '#6b7280' },
  { name: 'Under Construction', color: '#f59e0b' },
  { name: 'Sold', color: '#2563eb' },
  { name: 'Archived', color: '#9ca3af' },
];

export const DEFAULT_PROPERTY_FEATURES = [
  'Swimming Pool',
  'Gym',
  'Lift',
  'Parking',
  'Generator',
  'Solar',
  'Borehole',
  'Security',
  'CCTV',
  'Internet',
];

export const DEFAULT_PROPERTY_TAGS: Array<{ name: string; color: string }> = [
  { name: 'Luxury', color: '#a855f7' },
  { name: 'Premium', color: '#f59e0b' },
  { name: 'Affordable', color: '#16a34a' },
  { name: 'Corporate', color: '#2563eb' },
  { name: 'Waterfront', color: '#06b6d4' },
  { name: 'Featured', color: '#ef4444' },
];
