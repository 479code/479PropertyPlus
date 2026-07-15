export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
}

export interface LeaseType extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface PaymentFrequency extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export type LeaseStatusKey =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'AWAITING_SIGNATURE'
  | 'ACTIVE'
  | 'RENEWAL_PENDING'
  | 'EXPIRED'
  | 'TERMINATED'
  | 'ARCHIVED';

export interface LeaseStatus extends AuditFields {
  id: string;
  organizationId: string;
  key: LeaseStatusKey;
  name: string;
  color: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  blocksUnitAvailability: boolean;
  countsAsOccupancy: boolean;
  isSystem: boolean;
}

export type LeaseTenantRole = 'PRIMARY' | 'CO_TENANT' | 'OCCUPANT' | 'AUTHORIZED_REPRESENTATIVE';

export interface PersonRef {
  id: string;
  fullName: string;
  personCode: string;
  email?: string | null;
  phone?: string | null;
}

export interface LeaseTenant {
  id: string;
  leaseId: string;
  personId: string;
  role: LeaseTenantRole;
  ownershipPercentage: number | null;
  createdAt: string;
  person: PersonRef;
}

export interface LeaseGuarantor {
  id: string;
  leaseId: string;
  personId: string;
  guaranteeType: string | null;
  guaranteeAmount: number | null;
  relationshipToTenant: string | null;
  status: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  person: PersonRef;
}

export interface Lease extends AuditFields {
  id: string;
  organizationId: string;
  leaseNumber: string;
  leaseReference: string | null;
  slug: string;
  propertyId: string;
  buildingId: string | null;
  unitId: string;
  primaryTenantId: string;
  leaseTypeId: string;
  leaseStatusId: string;
  property: { id: string; name: string; propertyCode: string };
  building: { id: string; name: string; buildingCode: string } | null;
  unit: { id: string; name: string; unitCode: string };
  primaryTenant: PersonRef;
  leaseType: LeaseType;
  leaseStatus: LeaseStatus;
  paymentFrequency: PaymentFrequency | null;
  leaseStartDate: string;
  leaseEndDate: string;
  moveInDate: string | null;
  moveOutDate: string | null;
  leaseDurationMonths: number | null;
  renewalNoticeDays: number | null;
  gracePeriodDays: number | null;
  securityDeposit: number | null;
  monthlyRent: number | null;
  annualRent: number | null;
  serviceCharge: number | null;
  utilityCharge: number | null;
  parkingCharge: number | null;
  discount: number | null;
  taxAmount: number | null;
  totalRecurringAmount: number | null;
  paymentFrequencyId: string | null;
  billingCycle: string | null;
  nextInvoiceDate: string | null;
  autoRenew: boolean;
  signedDate: string | null;
  terminationDate: string | null;
  terminationReason: string | null;
  notes: string | null;
  isActive: boolean;
  tenants: LeaseTenant[];
  guarantors: LeaseGuarantor[];
}

export type LeaseDocumentType =
  | 'LEASE_AGREEMENT'
  | 'SIGNED_CONTRACT'
  | 'ADDENDUM'
  | 'IDENTITY_DOCUMENT'
  | 'INSPECTION_REPORT'
  | 'HANDOVER_REPORT'
  | 'OTHER';

export interface LeaseDocument {
  id: string;
  leaseId: string;
  documentType: LeaseDocumentType;
  name: string;
  url: string;
  description: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeaseTimelineEventType =
  | 'CREATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SIGNED'
  | 'ACTIVATED'
  | 'RENEWAL_INITIATED'
  | 'RENEWED'
  | 'EXTENDED'
  | 'EXPIRED'
  | 'TERMINATED'
  | 'ARCHIVED';

export interface LeaseTimelineEntry {
  id: string;
  leaseId: string;
  eventType: LeaseTimelineEventType;
  description: string | null;
  metadata: unknown;
  performedBy: string | null;
  createdAt: string;
}

export interface LeaseNote {
  id: string;
  leaseId: string;
  authorId: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaseDashboardSummary {
  totalLeases: number;
  activeLeases: number;
  pendingApproval: number;
  awaitingSignature: number;
  expiringIn30Days: number;
  expired: number;
  terminated: number;
  averageLeaseDurationMonths: number | null;
  occupancyRate: number;
  monthlyRentalValue: number;
  annualContractValue: number;
  upcomingRenewals: number;
  upcomingMoveIns: number;
  upcomingMoveOuts: number;
}
