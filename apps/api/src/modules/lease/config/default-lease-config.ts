/** Default lease configuration seeded into every organization (idempotent backfill). */

export const DEFAULT_LEASE_TYPES = [
  'Residential',
  'Commercial',
  'Office',
  'Warehouse',
  'Short Stay',
  'Monthly',
  'Annual',
  'Corporate',
  'Staff Accommodation',
];

export const DEFAULT_PAYMENT_FREQUENCIES = [
  'Weekly',
  'Monthly',
  'Quarterly',
  'Bi-Annual',
  'Annual',
  'Custom',
];

export interface DefaultLeaseStatus {
  key: string;
  name: string;
  color: string;
  displayOrder: number;
  /** Unit inventory is reserved by this lease — no other blocking lease may overlap its dates. */
  blocksUnitAvailability: boolean;
  /** Unit should read as OCCUPIED while a lease is in this status. */
  countsAsOccupancy: boolean;
}

/**
 * Approved architecture: Draft/Rejected/Expired/Terminated/Archived are
 * non-blocking (they don't reserve inventory); Pending Approval/Awaiting
 * Signature/Active/Renewal Pending are blocking. Active and Renewal Pending
 * also count as occupancy (the unit is genuinely lived-in during a pending
 * renewal, since the outgoing lease hasn't actually ended yet).
 */
export const DEFAULT_LEASE_STATUSES: DefaultLeaseStatus[] = [
  {
    key: 'DRAFT',
    name: 'Draft',
    color: '#6b7280',
    displayOrder: 0,
    blocksUnitAvailability: false,
    countsAsOccupancy: false,
  },
  {
    key: 'PENDING_APPROVAL',
    name: 'Pending Approval',
    color: '#f59e0b',
    displayOrder: 1,
    blocksUnitAvailability: true,
    countsAsOccupancy: false,
  },
  {
    key: 'REJECTED',
    name: 'Rejected',
    color: '#ef4444',
    displayOrder: 2,
    blocksUnitAvailability: false,
    countsAsOccupancy: false,
  },
  {
    key: 'AWAITING_SIGNATURE',
    name: 'Awaiting Signature',
    color: '#f59e0b',
    displayOrder: 3,
    blocksUnitAvailability: true,
    countsAsOccupancy: false,
  },
  {
    key: 'ACTIVE',
    name: 'Active',
    color: '#16a34a',
    displayOrder: 4,
    blocksUnitAvailability: true,
    countsAsOccupancy: true,
  },
  {
    key: 'RENEWAL_PENDING',
    name: 'Renewal Pending',
    color: '#2563eb',
    displayOrder: 5,
    blocksUnitAvailability: true,
    countsAsOccupancy: true,
  },
  {
    key: 'EXPIRED',
    name: 'Expired',
    color: '#9ca3af',
    displayOrder: 6,
    blocksUnitAvailability: false,
    countsAsOccupancy: false,
  },
  {
    key: 'TERMINATED',
    name: 'Terminated',
    color: '#dc2626',
    displayOrder: 7,
    blocksUnitAvailability: false,
    countsAsOccupancy: false,
  },
  {
    key: 'ARCHIVED',
    name: 'Archived',
    color: '#374151',
    displayOrder: 8,
    blocksUnitAvailability: false,
    countsAsOccupancy: false,
  },
];

/**
 * Approved state machine edges (from-key -> to-key). Stored as data
 * (LeaseStateTransition rows) rather than a hardcoded switch, per architect
 * direction, so the graph can be edited later without a code change.
 */
export const DEFAULT_LEASE_STATE_TRANSITIONS: Array<[string, string]> = [
  ['DRAFT', 'PENDING_APPROVAL'],
  ['PENDING_APPROVAL', 'AWAITING_SIGNATURE'],
  ['PENDING_APPROVAL', 'REJECTED'],
  ['REJECTED', 'PENDING_APPROVAL'],
  ['AWAITING_SIGNATURE', 'ACTIVE'],
  ['AWAITING_SIGNATURE', 'REJECTED'],
  ['ACTIVE', 'RENEWAL_PENDING'],
  ['ACTIVE', 'TERMINATED'],
  ['ACTIVE', 'EXPIRED'],
  ['RENEWAL_PENDING', 'ACTIVE'],
  ['RENEWAL_PENDING', 'TERMINATED'],
  ['EXPIRED', 'ARCHIVED'],
  ['TERMINATED', 'ARCHIVED'],
];
