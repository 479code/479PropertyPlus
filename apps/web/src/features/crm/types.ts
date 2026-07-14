export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
}

export interface PersonType extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface PersonTag extends AuditFields {
  id: string;
  organizationId: string;
  name: string;
  color: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface PersonRole {
  id: string;
  personId: string;
  personTypeId: string;
  personType: PersonType;
  isPrimary: boolean;
  createdAt: string;
}

export interface PersonTagAssignment {
  id: string;
  personId: string;
  tagId: string;
  tag: PersonTag;
  createdAt: string;
}

export interface CompanyRef {
  id: string;
  companyName: string;
}

export interface TenantProfile extends AuditFields {
  id: string;
  personId: string;
  companyId: string | null;
  company: CompanyRef | null;
  employmentStatus: string | null;
  employer: string | null;
  monthlyIncome: number | null;
  preferredPaymentMethod: string | null;
  preferredCommunication: string | null;
  riskRating: string | null;
  creditScore: number | null;
  status: string | null;
  defaultGuarantorPersonId: string | null;
}

export interface AgentProfile extends AuditFields {
  id: string;
  personId: string;
  agencyName: string | null;
  commissionRate: number | null;
  licenceNumber: string | null;
  territory: string | null;
  notes: string | null;
}

export interface OwnerProfile extends AuditFields {
  id: string;
  personId: string;
  ownershipType: string | null;
  bankDetails: Record<string, unknown> | null;
  payoutPreference: string | null;
  notes: string | null;
}

export interface Person extends AuditFields {
  id: string;
  organizationId: string;
  personCode: string;
  slug: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  gender: string | null;
  dateOfBirth: string | null;
  maritalStatus: string | null;
  nationality: string | null;
  occupation: string | null;
  email: string | null;
  phone: string | null;
  alternatePhone: string | null;
  profilePhoto: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  identificationType: string | null;
  identificationNumber: string | null;
  identificationExpiry: string | null;
  taxIdentificationNumber: string | null;
  notes: string | null;
  isActive: boolean;
  roles: PersonRole[];
  tagAssignments: PersonTagAssignment[];
  tenantProfile: TenantProfile | null;
  ownerProfile: OwnerProfile | null;
  agentProfile: AgentProfile | null;
}

export interface Company extends AuditFields {
  id: string;
  organizationId: string;
  companyName: string;
  registrationNumber: string | null;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  contactPersonId: string | null;
  contactPerson: Person | null;
  notes: string | null;
}

export interface EmergencyContact {
  id: string;
  personId: string;
  contactPersonId: string;
  contactPerson: Person;
  relationship: string;
  priority: number;
  isPrimary: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PersonDocumentType =
  | 'PASSPORT'
  | 'NATIONAL_ID'
  | 'DRIVERS_LICENCE'
  | 'UTILITY_BILL'
  | 'EMPLOYMENT_LETTER'
  | 'COMPANY_REGISTRATION'
  | 'TAX_CERTIFICATE'
  | 'OTHER';

export interface PersonDocument {
  id: string;
  personId: string;
  documentType: PersonDocumentType;
  name: string;
  url: string;
  description: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContactHistoryType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'SMS' | 'WHATSAPP';

export interface ContactHistoryEntry {
  id: string;
  personId: string;
  type: ContactHistoryType;
  subject: string | null;
  notes: string | null;
  occurredAt: string;
  performedBy: string | null;
  createdAt: string;
}

export interface CrmDashboardSummary {
  totalTenants: number;
  corporateTenants: number;
  individualTenants: number;
  owners: number;
  agents: number;
  inactiveContacts: number;
  recentRegistrations: number;
  upcomingIdExpiry: number;
}
