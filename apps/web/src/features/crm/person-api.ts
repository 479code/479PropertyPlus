import { apiClient } from '../../lib/api-client';
import { type Paginated } from '../property/api';

import { type Person } from './types';

export interface CreatePersonInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  nationality?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  profilePhoto?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  identificationType?: string;
  identificationNumber?: string;
  identificationExpiry?: string;
  taxIdentificationNumber?: string;
  notes?: string;
  isActive?: boolean;
  personCode?: string;
  roleIds?: string[];
  primaryRoleId?: string;
}

export type UpdatePersonInput = Partial<CreatePersonInput>;

export interface SearchPeopleParams {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  identificationNumber?: string;
  q?: string;
  companyId?: string;
  personTypeId?: string;
  tagIds?: string[];
  isActive?: boolean;
  includeArchived?: boolean;
  sortBy?: 'createdAt' | 'fullName' | 'personCode';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function searchPeople(params: SearchPeopleParams): Promise<Paginated<Person>> {
  const { data } = await apiClient.get<Paginated<Person>>('/people', {
    params: { ...params, tagIds: params.tagIds?.join(',') },
  });
  return data;
}

export async function getPerson(id: string): Promise<Person> {
  const { data } = await apiClient.get<Person>(`/people/${id}`);
  return data;
}

export async function createPerson(input: CreatePersonInput): Promise<Person> {
  const { data } = await apiClient.post<Person>('/people', input);
  return data;
}

export async function updatePerson(id: string, input: UpdatePersonInput): Promise<Person> {
  const { data } = await apiClient.patch<Person>(`/people/${id}`, input);
  return data;
}

export async function archivePerson(id: string): Promise<void> {
  await apiClient.post(`/people/${id}/archive`);
}

export async function restorePerson(id: string): Promise<Person> {
  const { data } = await apiClient.post<Person>(`/people/${id}/restore`);
  return data;
}

export async function addPersonTag(personId: string, tagId: string): Promise<Person> {
  const { data } = await apiClient.post<Person>(`/people/${personId}/tags/${tagId}`);
  return data;
}

export async function removePersonTag(personId: string, tagId: string): Promise<Person> {
  const { data } = await apiClient.delete<Person>(`/people/${personId}/tags/${tagId}`);
  return data;
}
