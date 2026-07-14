import { apiClient } from '../../lib/api-client';

import {
  type ContactHistoryEntry,
  type ContactHistoryType,
  type CrmDashboardSummary,
  type EmergencyContact,
  type PersonDocument,
  type PersonDocumentType,
  type PersonTag,
  type PersonType,
} from './types';

// ── Emergency contacts ──
export interface EmergencyContactInput {
  contactPersonId: string;
  relationship: string;
  priority?: number;
  isPrimary?: boolean;
  notes?: string;
}

export async function listEmergencyContacts(personId: string): Promise<EmergencyContact[]> {
  const { data } = await apiClient.get<EmergencyContact[]>(
    `/people/${personId}/emergency-contacts`,
  );
  return data;
}
export async function addEmergencyContact(
  personId: string,
  input: EmergencyContactInput,
): Promise<EmergencyContact> {
  const { data } = await apiClient.post<EmergencyContact>(
    `/people/${personId}/emergency-contacts`,
    input,
  );
  return data;
}
export async function updateEmergencyContact(
  personId: string,
  id: string,
  input: Partial<EmergencyContactInput>,
): Promise<EmergencyContact> {
  const { data } = await apiClient.patch<EmergencyContact>(
    `/people/${personId}/emergency-contacts/${id}`,
    input,
  );
  return data;
}
export async function removeEmergencyContact(personId: string, id: string): Promise<void> {
  await apiClient.delete(`/people/${personId}/emergency-contacts/${id}`);
}

// ── Documents ──
export interface PersonDocumentInput {
  documentType: PersonDocumentType;
  name: string;
  url: string;
  description?: string;
}

export async function listPersonDocuments(personId: string): Promise<PersonDocument[]> {
  const { data } = await apiClient.get<PersonDocument[]>(`/people/${personId}/documents`);
  return data;
}
export async function addPersonDocument(
  personId: string,
  input: PersonDocumentInput,
): Promise<PersonDocument> {
  const { data } = await apiClient.post<PersonDocument>(`/people/${personId}/documents`, input);
  return data;
}
export async function removePersonDocument(personId: string, id: string): Promise<void> {
  await apiClient.delete(`/people/${personId}/documents/${id}`);
}

// ── Contact history ──
export interface ContactHistoryInput {
  type: ContactHistoryType;
  subject?: string;
  notes?: string;
  occurredAt?: string;
}

export async function listContactHistory(personId: string): Promise<ContactHistoryEntry[]> {
  const { data } = await apiClient.get<ContactHistoryEntry[]>(
    `/people/${personId}/contact-history`,
  );
  return data;
}
export async function addContactHistory(
  personId: string,
  input: ContactHistoryInput,
): Promise<ContactHistoryEntry> {
  const { data } = await apiClient.post<ContactHistoryEntry>(
    `/people/${personId}/contact-history`,
    input,
  );
  return data;
}
export async function removeContactHistory(personId: string, id: string): Promise<void> {
  await apiClient.delete(`/people/${personId}/contact-history/${id}`);
}

// ── Dashboard ──
export async function getCrmDashboard(): Promise<CrmDashboardSummary> {
  const { data } = await apiClient.get<CrmDashboardSummary>('/crm/dashboard');
  return data;
}

// ── Config: person types & tags ──
export interface PersonTypeInput {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}
export interface PersonTagInput {
  name: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function listPersonTypes(): Promise<PersonType[]> {
  const { data } = await apiClient.get<PersonType[]>('/person-types');
  return data;
}
export async function createPersonType(input: PersonTypeInput): Promise<PersonType> {
  const { data } = await apiClient.post<PersonType>('/person-types', input);
  return data;
}
export async function updatePersonType(
  id: string,
  input: Partial<PersonTypeInput>,
): Promise<PersonType> {
  const { data } = await apiClient.patch<PersonType>(`/person-types/${id}`, input);
  return data;
}
export async function deletePersonType(id: string): Promise<void> {
  await apiClient.delete(`/person-types/${id}`);
}

export async function listPersonTags(): Promise<PersonTag[]> {
  const { data } = await apiClient.get<PersonTag[]>('/person-tags');
  return data;
}
export async function createPersonTag(input: PersonTagInput): Promise<PersonTag> {
  const { data } = await apiClient.post<PersonTag>('/person-tags', input);
  return data;
}
export async function updatePersonTag(
  id: string,
  input: Partial<PersonTagInput>,
): Promise<PersonTag> {
  const { data } = await apiClient.patch<PersonTag>(`/person-tags/${id}`, input);
  return data;
}
export async function deletePersonTag(id: string): Promise<void> {
  await apiClient.delete(`/person-tags/${id}`);
}
