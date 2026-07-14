import { apiClient } from '../../lib/api-client';

import { type BuildingStatus, type UnitFeature, type UnitStatus, type UnitType } from './types';

interface NamedConfigInput {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface BuildingStatusInput extends NamedConfigInput {
  color?: string;
}
export interface UnitTypeInput extends NamedConfigInput {
  icon?: string;
  color?: string;
}
export interface UnitStatusInput extends NamedConfigInput {
  color?: string;
}
export interface UnitFeatureInput {
  name: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// Building statuses
export async function listBuildingStatuses(): Promise<BuildingStatus[]> {
  const { data } = await apiClient.get<BuildingStatus[]>('/building-statuses');
  return data;
}
export async function createBuildingStatus(input: BuildingStatusInput): Promise<BuildingStatus> {
  const { data } = await apiClient.post<BuildingStatus>('/building-statuses', input);
  return data;
}
export async function updateBuildingStatus(
  id: string,
  input: Partial<BuildingStatusInput>,
): Promise<BuildingStatus> {
  const { data } = await apiClient.patch<BuildingStatus>(`/building-statuses/${id}`, input);
  return data;
}
export async function deleteBuildingStatus(id: string): Promise<void> {
  await apiClient.delete(`/building-statuses/${id}`);
}

// Unit types
export async function listUnitTypes(): Promise<UnitType[]> {
  const { data } = await apiClient.get<UnitType[]>('/unit-types');
  return data;
}
export async function createUnitType(input: UnitTypeInput): Promise<UnitType> {
  const { data } = await apiClient.post<UnitType>('/unit-types', input);
  return data;
}
export async function updateUnitType(id: string, input: Partial<UnitTypeInput>): Promise<UnitType> {
  const { data } = await apiClient.patch<UnitType>(`/unit-types/${id}`, input);
  return data;
}
export async function deleteUnitType(id: string): Promise<void> {
  await apiClient.delete(`/unit-types/${id}`);
}

// Unit statuses
export async function listUnitStatuses(): Promise<UnitStatus[]> {
  const { data } = await apiClient.get<UnitStatus[]>('/unit-statuses');
  return data;
}
export async function createUnitStatus(input: UnitStatusInput): Promise<UnitStatus> {
  const { data } = await apiClient.post<UnitStatus>('/unit-statuses', input);
  return data;
}
export async function updateUnitStatus(
  id: string,
  input: Partial<UnitStatusInput>,
): Promise<UnitStatus> {
  const { data } = await apiClient.patch<UnitStatus>(`/unit-statuses/${id}`, input);
  return data;
}
export async function deleteUnitStatus(id: string): Promise<void> {
  await apiClient.delete(`/unit-statuses/${id}`);
}

// Unit features
export async function listUnitFeatures(): Promise<UnitFeature[]> {
  const { data } = await apiClient.get<UnitFeature[]>('/unit-features');
  return data;
}
export async function createUnitFeature(input: UnitFeatureInput): Promise<UnitFeature> {
  const { data } = await apiClient.post<UnitFeature>('/unit-features', input);
  return data;
}
export async function updateUnitFeature(
  id: string,
  input: Partial<UnitFeatureInput>,
): Promise<UnitFeature> {
  const { data } = await apiClient.patch<UnitFeature>(`/unit-features/${id}`, input);
  return data;
}
export async function deleteUnitFeature(id: string): Promise<void> {
  await apiClient.delete(`/unit-features/${id}`);
}
