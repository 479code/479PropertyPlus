/** Default CRM configuration seeded into every organization (idempotent backfill). */

export const DEFAULT_PERSON_TYPES = [
  'Tenant',
  'Owner',
  'Agent',
  'Broker',
  'Guarantor',
  'Emergency Contact',
  'Vendor',
  'Legal Representative',
];

export const DEFAULT_PERSON_TAGS: Array<{ name: string; color: string }> = [
  { name: 'VIP', color: '#f59e0b' },
  { name: 'Defaulter', color: '#ef4444' },
  { name: 'High Risk', color: '#dc2626' },
  { name: 'Preferred', color: '#16a34a' },
  { name: 'Corporate', color: '#2563eb' },
  { name: 'Blacklisted', color: '#7f1d1d' },
];
