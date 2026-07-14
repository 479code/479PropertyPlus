import { apiClient } from '../../lib/api-client';
import { type Paginated } from '../property/api';

import {
  type Unit,
  type UnitAvailability,
  type UnitOccupancyHistoryEntry,
  type UnitOwnerType,
  type UnitTimelineEntry,
} from './types';

export interface CreateUnitInput {
  propertyId: string;
  buildingId?: string;
  floorId?: string;
  name: string;
  description?: string;
  unitCode?: string;
  unitTypeId: string;
  statusId: string;
  isReserved?: boolean;
  isBlocked?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  parkingSpaces?: number;
  size?: number;
  sizeUnit?: string;
  monthlyRent?: number;
  annualRent?: number;
  securityDeposit?: number;
  serviceCharge?: number;
  expectedAnnualRevenue?: number;
  marketValue?: number;
  ownerType?: UnitOwnerType;
  ownerReferenceId?: string;
  latitude?: number;
  longitude?: number;
  isRentable?: boolean;
  featureIds?: string[];
}

export type UpdateUnitInput = Partial<CreateUnitInput>;

export interface SearchUnitsParams {
  code?: string;
  name?: string;
  q?: string;
  propertyId?: string;
  buildingId?: string;
  floorId?: string;
  unitTypeId?: string;
  statusId?: string;
  availability?: UnitAvailability;
  bedrooms?: number;
  bathrooms?: number;
  rentMin?: number;
  rentMax?: number;
  featureIds?: string[];
  includeArchived?: boolean;
  sortBy?: 'createdAt' | 'name' | 'unitCode' | 'monthlyRent' | 'bedrooms';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function searchUnits(params: SearchUnitsParams): Promise<Paginated<Unit>> {
  const { data } = await apiClient.get<Paginated<Unit>>('/units', {
    params: { ...params, featureIds: params.featureIds?.join(',') },
  });
  return data;
}

export async function getUnit(id: string): Promise<Unit> {
  const { data } = await apiClient.get<Unit>(`/units/${id}`);
  return data;
}

export async function getUnitTimeline(id: string): Promise<UnitTimelineEntry[]> {
  const { data } = await apiClient.get<UnitTimelineEntry[]>(`/units/${id}/timeline`);
  return data;
}

export async function getUnitOccupancyHistory(id: string): Promise<UnitOccupancyHistoryEntry[]> {
  const { data } = await apiClient.get<UnitOccupancyHistoryEntry[]>(
    `/units/${id}/occupancy-history`,
  );
  return data;
}

export async function createUnit(input: CreateUnitInput): Promise<Unit> {
  const { data } = await apiClient.post<Unit>('/units', input);
  return data;
}

export async function updateUnit(id: string, input: UpdateUnitInput): Promise<Unit> {
  const { data } = await apiClient.patch<Unit>(`/units/${id}`, input);
  return data;
}

export async function archiveUnit(id: string): Promise<void> {
  await apiClient.post(`/units/${id}/archive`);
}

export async function restoreUnit(id: string): Promise<Unit> {
  const { data } = await apiClient.post<Unit>(`/units/${id}/restore`);
  return data;
}
