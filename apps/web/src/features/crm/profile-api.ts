import { apiClient } from '../../lib/api-client';

import { type AgentProfile, type OwnerProfile, type TenantProfile } from './types';

export interface TenantProfileInput {
  companyId?: string;
  employmentStatus?: string;
  employer?: string;
  monthlyIncome?: number;
  preferredPaymentMethod?: string;
  preferredCommunication?: string;
  riskRating?: string;
  creditScore?: number;
  status?: string;
  defaultGuarantorPersonId?: string;
}

export interface AgentProfileInput {
  agencyName?: string;
  commissionRate?: number;
  licenceNumber?: string;
  territory?: string;
  notes?: string;
}

export interface OwnerProfileInput {
  ownershipType?: string;
  bankDetails?: Record<string, unknown>;
  payoutPreference?: string;
  notes?: string;
}

export async function getTenantProfile(personId: string): Promise<TenantProfile> {
  const { data } = await apiClient.get<TenantProfile>(`/people/${personId}/tenant-profile`);
  return data;
}
export async function upsertTenantProfile(
  personId: string,
  input: TenantProfileInput,
): Promise<TenantProfile> {
  const { data } = await apiClient.put<TenantProfile>(`/people/${personId}/tenant-profile`, input);
  return data;
}
export async function removeTenantProfile(personId: string): Promise<void> {
  await apiClient.delete(`/people/${personId}/tenant-profile`);
}

export async function getAgentProfile(personId: string): Promise<AgentProfile> {
  const { data } = await apiClient.get<AgentProfile>(`/people/${personId}/agent-profile`);
  return data;
}
export async function upsertAgentProfile(
  personId: string,
  input: AgentProfileInput,
): Promise<AgentProfile> {
  const { data } = await apiClient.put<AgentProfile>(`/people/${personId}/agent-profile`, input);
  return data;
}
export async function removeAgentProfile(personId: string): Promise<void> {
  await apiClient.delete(`/people/${personId}/agent-profile`);
}

export async function getOwnerProfile(personId: string): Promise<OwnerProfile> {
  const { data } = await apiClient.get<OwnerProfile>(`/people/${personId}/owner-profile`);
  return data;
}
export async function upsertOwnerProfile(
  personId: string,
  input: OwnerProfileInput,
): Promise<OwnerProfile> {
  const { data } = await apiClient.put<OwnerProfile>(`/people/${personId}/owner-profile`, input);
  return data;
}
export async function removeOwnerProfile(personId: string): Promise<void> {
  await apiClient.delete(`/people/${personId}/owner-profile`);
}
