/** Default inventory configuration seeded into every organization (idempotent backfill). */

export const DEFAULT_BUILDING_STATUSES: Array<{ name: string; color: string }> = [
  { name: 'Active', color: '#16a34a' },
  { name: 'Inactive', color: '#6b7280' },
  { name: 'Under Construction', color: '#f59e0b' },
  { name: 'Renovation', color: '#8b5cf6' },
  { name: 'Archived', color: '#9ca3af' },
];

export const DEFAULT_UNIT_TYPES = [
  'Apartment',
  'Studio',
  'Duplex',
  'Penthouse',
  'Office',
  'Shop',
  'Warehouse',
  'Room',
  'Parking Space',
  'Storage',
  'Land Parcel',
  'Villa',
  'Bungalow',
  'Hall',
];

export const DEFAULT_UNIT_STATUSES: Array<{ name: string; color: string }> = [
  { name: 'Available', color: '#16a34a' },
  { name: 'Occupied', color: '#2563eb' },
  { name: 'Reserved', color: '#f59e0b' },
  { name: 'Under Maintenance', color: '#f97316' },
  { name: 'Blocked', color: '#ef4444' },
  { name: 'Inactive', color: '#6b7280' },
  { name: 'Archived', color: '#9ca3af' },
];

export const DEFAULT_UNIT_FEATURES = [
  'Balcony',
  'Air Conditioning',
  'Furnished',
  'Smart Lock',
  'Solar',
  'Generator',
  'Internet',
  'CCTV',
  'Garden',
  'Elevator Access',
];
