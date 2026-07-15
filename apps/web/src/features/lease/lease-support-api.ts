import { apiClient } from '../../lib/api-client';

import {
  type LeaseDashboardSummary,
  type LeaseDocument,
  type LeaseDocumentType,
  type LeaseGuarantor,
  type LeaseNote,
  type LeaseTenant,
  type LeaseTenantRole,
  type LeaseTimelineEntry,
} from './types';

// ── Tenants ──
export interface LeaseTenantInput {
  personId: string;
  role?: LeaseTenantRole;
  ownershipPercentage?: number;
}
export async function listLeaseTenants(leaseId: string): Promise<LeaseTenant[]> {
  const { data } = await apiClient.get<LeaseTenant[]>(`/leases/${leaseId}/tenants`);
  return data;
}
export async function addLeaseTenant(
  leaseId: string,
  input: LeaseTenantInput,
): Promise<LeaseTenant> {
  const { data } = await apiClient.post<LeaseTenant>(`/leases/${leaseId}/tenants`, input);
  return data;
}
export async function removeLeaseTenant(leaseId: string, id: string): Promise<void> {
  await apiClient.delete(`/leases/${leaseId}/tenants/${id}`);
}

// ── Guarantors ──
export interface LeaseGuarantorInput {
  personId: string;
  guaranteeType?: string;
  guaranteeAmount?: number;
  relationshipToTenant?: string;
  status?: string;
  notes?: string;
}
export async function listLeaseGuarantors(leaseId: string): Promise<LeaseGuarantor[]> {
  const { data } = await apiClient.get<LeaseGuarantor[]>(`/leases/${leaseId}/guarantors`);
  return data;
}
export async function addLeaseGuarantor(
  leaseId: string,
  input: LeaseGuarantorInput,
): Promise<LeaseGuarantor> {
  const { data } = await apiClient.post<LeaseGuarantor>(`/leases/${leaseId}/guarantors`, input);
  return data;
}
export async function removeLeaseGuarantor(leaseId: string, id: string): Promise<void> {
  await apiClient.delete(`/leases/${leaseId}/guarantors/${id}`);
}

// ── Documents ──
export interface LeaseDocumentInput {
  documentType: LeaseDocumentType;
  name: string;
  url: string;
  description?: string;
}
export async function listLeaseDocuments(leaseId: string): Promise<LeaseDocument[]> {
  const { data } = await apiClient.get<LeaseDocument[]>(`/leases/${leaseId}/documents`);
  return data;
}
export async function addLeaseDocument(
  leaseId: string,
  input: LeaseDocumentInput,
): Promise<LeaseDocument> {
  const { data } = await apiClient.post<LeaseDocument>(`/leases/${leaseId}/documents`, input);
  return data;
}
export async function removeLeaseDocument(leaseId: string, id: string): Promise<void> {
  await apiClient.delete(`/leases/${leaseId}/documents/${id}`);
}

// ── Timeline (read only) ──
export async function listLeaseTimeline(leaseId: string): Promise<LeaseTimelineEntry[]> {
  const { data } = await apiClient.get<LeaseTimelineEntry[]>(`/leases/${leaseId}/timeline`);
  return data;
}

// ── Notes ──
export async function listLeaseNotes(leaseId: string): Promise<LeaseNote[]> {
  const { data } = await apiClient.get<LeaseNote[]>(`/leases/${leaseId}/notes`);
  return data;
}
export async function addLeaseNote(leaseId: string, note: string): Promise<LeaseNote> {
  const { data } = await apiClient.post<LeaseNote>(`/leases/${leaseId}/notes`, { note });
  return data;
}
export async function removeLeaseNote(leaseId: string, id: string): Promise<void> {
  await apiClient.delete(`/leases/${leaseId}/notes/${id}`);
}

// ── Dashboard ──
export async function getLeaseDashboard(): Promise<LeaseDashboardSummary> {
  const { data } = await apiClient.get<LeaseDashboardSummary>('/leases-dashboard');
  return data;
}
