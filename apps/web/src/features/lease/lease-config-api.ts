import { apiClient } from '../../lib/api-client';

import { type LeaseStatus, type LeaseType, type PaymentFrequency } from './types';

export interface NamedConfigInput {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function listLeaseTypes(): Promise<LeaseType[]> {
  const { data } = await apiClient.get<LeaseType[]>('/lease-types');
  return data;
}
export async function createLeaseType(input: NamedConfigInput): Promise<LeaseType> {
  const { data } = await apiClient.post<LeaseType>('/lease-types', input);
  return data;
}
export async function updateLeaseType(
  id: string,
  input: Partial<NamedConfigInput>,
): Promise<LeaseType> {
  const { data } = await apiClient.patch<LeaseType>(`/lease-types/${id}`, input);
  return data;
}
export async function deleteLeaseType(id: string): Promise<void> {
  await apiClient.delete(`/lease-types/${id}`);
}

export async function listPaymentFrequencies(): Promise<PaymentFrequency[]> {
  const { data } = await apiClient.get<PaymentFrequency[]>('/payment-frequencies');
  return data;
}
export async function createPaymentFrequency(input: NamedConfigInput): Promise<PaymentFrequency> {
  const { data } = await apiClient.post<PaymentFrequency>('/payment-frequencies', input);
  return data;
}
export async function updatePaymentFrequency(
  id: string,
  input: Partial<NamedConfigInput>,
): Promise<PaymentFrequency> {
  const { data } = await apiClient.patch<PaymentFrequency>(`/payment-frequencies/${id}`, input);
  return data;
}
export async function deletePaymentFrequency(id: string): Promise<void> {
  await apiClient.delete(`/payment-frequencies/${id}`);
}

export async function listLeaseStatuses(): Promise<LeaseStatus[]> {
  const { data } = await apiClient.get<LeaseStatus[]>('/lease-statuses');
  return data;
}
export interface LeaseStatusUpdateInput {
  name?: string;
  color?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}
export async function updateLeaseStatus(
  id: string,
  input: LeaseStatusUpdateInput,
): Promise<LeaseStatus> {
  const { data } = await apiClient.patch<LeaseStatus>(`/lease-statuses/${id}`, input);
  return data;
}
