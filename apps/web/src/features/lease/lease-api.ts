import { apiClient } from '../../lib/api-client';
import { type Paginated } from '../property/api';

import { type Lease, type LeaseTenantRole } from './types';

export interface CreateLeaseInput {
  propertyId: string;
  buildingId?: string;
  unitId: string;
  primaryTenantId: string;
  leaseTypeId: string;
  paymentFrequencyId?: string;
  leaseReference?: string;
  leaseStartDate: string;
  leaseEndDate: string;
  moveInDate?: string;
  moveOutDate?: string;
  leaseDurationMonths?: number;
  renewalNoticeDays?: number;
  gracePeriodDays?: number;
  securityDeposit?: number;
  monthlyRent?: number;
  annualRent?: number;
  serviceCharge?: number;
  utilityCharge?: number;
  parkingCharge?: number;
  discount?: number;
  taxAmount?: number;
  totalRecurringAmount?: number;
  billingCycle?: string;
  nextInvoiceDate?: string;
  autoRenew?: boolean;
  notes?: string;
  additionalTenants?: Array<{
    personId: string;
    role?: LeaseTenantRole;
    ownershipPercentage?: number;
  }>;
  guarantors?: Array<{
    personId: string;
    guaranteeType?: string;
    guaranteeAmount?: number;
    relationshipToTenant?: string;
  }>;
}

export type UpdateLeaseInput = Partial<CreateLeaseInput>;

export interface SearchLeasesParams {
  leaseNumber?: string;
  tenantName?: string;
  propertyId?: string;
  buildingId?: string;
  unitId?: string;
  leaseStatusId?: string;
  leaseTypeId?: string;
  paymentFrequencyId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  expiringInDays?: number;
  q?: string;
  includeArchived?: boolean;
  sortBy?: 'createdAt' | 'leaseNumber' | 'leaseStartDate' | 'leaseEndDate' | 'monthlyRent';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function searchLeases(params: SearchLeasesParams): Promise<Paginated<Lease>> {
  const { data } = await apiClient.get<Paginated<Lease>>('/leases', { params });
  return data;
}

export async function getLease(id: string): Promise<Lease> {
  const { data } = await apiClient.get<Lease>(`/leases/${id}`);
  return data;
}

export async function createLease(input: CreateLeaseInput): Promise<Lease> {
  const { data } = await apiClient.post<Lease>('/leases', input);
  return data;
}

export async function updateLease(id: string, input: UpdateLeaseInput): Promise<Lease> {
  const { data } = await apiClient.patch<Lease>(`/leases/${id}`, input);
  return data;
}

export async function submitLease(id: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/submit`);
  return data;
}
export async function approveLease(id: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/approve`);
  return data;
}
export async function rejectLease(id: string, reason?: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/reject`, { reason });
  return data;
}
export async function activateLease(id: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/activate`);
  return data;
}
export async function initiateRenewal(id: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/renewals/initiate`);
  return data;
}
export async function completeRenewal(id: string, newEndDate: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/renewals/complete`, { newEndDate });
  return data;
}
export async function rejectRenewal(id: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/renewals/reject`);
  return data;
}
export async function terminateLease(
  id: string,
  terminationDate: string,
  terminationReason: string,
): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/terminate`, {
    terminationDate,
    terminationReason,
  });
  return data;
}
export async function archiveLease(id: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/archive`);
  return data;
}
export async function restoreLease(id: string): Promise<Lease> {
  const { data } = await apiClient.post<Lease>(`/leases/${id}/restore`);
  return data;
}
