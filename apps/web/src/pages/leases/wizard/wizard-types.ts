export interface WizardTenant {
  personId: string;
  personName: string;
  role: 'CO_TENANT' | 'OCCUPANT' | 'AUTHORIZED_REPRESENTATIVE';
}

export interface WizardGuarantor {
  personId: string;
  personName: string;
  guaranteeType?: string;
  guaranteeAmount?: number;
  relationshipToTenant?: string;
}

export interface WizardDocument {
  documentType: string;
  name: string;
  url: string;
}

export interface LeaseWizardDraft {
  // Step 1-3: location
  propertyId: string;
  propertyName?: string;
  buildingId?: string;
  buildingName?: string;
  unitId: string;
  unitName?: string;

  // Step 4: tenants
  primaryTenantId: string;
  primaryTenantName?: string;
  additionalTenants: WizardTenant[];

  // Step 5: guarantors
  guarantors: WizardGuarantor[];

  // Step 6: lease details
  leaseTypeId: string;
  leaseReference?: string;
  leaseStartDate: string;
  leaseEndDate: string;
  moveInDate?: string;
  moveOutDate?: string;
  leaseDurationMonths?: number;
  renewalNoticeDays?: number;
  gracePeriodDays?: number;
  autoRenew: boolean;
  notes?: string;

  // Step 7: financial details
  monthlyRent?: number;
  annualRent?: number;
  securityDeposit?: number;
  serviceCharge?: number;
  utilityCharge?: number;
  parkingCharge?: number;
  discount?: number;
  taxAmount?: number;
  totalRecurringAmount?: number;
  paymentFrequencyId?: string;
  billingCycle?: string;

  // Step 8: documents
  documents: WizardDocument[];
}

export const WIZARD_STEPS = [
  'Property',
  'Building',
  'Unit',
  'Tenants',
  'Guarantors',
  'Lease Details',
  'Financial Details',
  'Documents',
  'Review',
  'Submit',
] as const;

export function emptyDraft(): LeaseWizardDraft {
  return {
    propertyId: '',
    unitId: '',
    primaryTenantId: '',
    additionalTenants: [],
    guarantors: [],
    leaseTypeId: '',
    leaseStartDate: '',
    leaseEndDate: '',
    autoRenew: false,
    documents: [],
  };
}
