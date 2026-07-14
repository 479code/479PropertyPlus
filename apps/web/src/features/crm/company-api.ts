import { apiClient } from '../../lib/api-client';
import { type Paginated } from '../property/api';

import { type Company } from './types';

export interface CompanyInput {
  companyName: string;
  registrationNumber?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  contactPersonId?: string;
  notes?: string;
}

export async function listCompanies(
  params: { name?: string; page?: number; pageSize?: number } = {},
): Promise<Paginated<Company>> {
  const { data } = await apiClient.get<Paginated<Company>>('/companies', { params });
  return data;
}

export async function getCompany(id: string): Promise<Company> {
  const { data } = await apiClient.get<Company>(`/companies/${id}`);
  return data;
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  const { data } = await apiClient.post<Company>('/companies', input);
  return data;
}

export async function updateCompany(id: string, input: Partial<CompanyInput>): Promise<Company> {
  const { data } = await apiClient.patch<Company>(`/companies/${id}`, input);
  return data;
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/companies/${id}`);
}
