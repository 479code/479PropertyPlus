import { apiClient } from '../../lib/api-client';
import { type Paginated } from '../property/api';

import { type Building, type BuildingSummary, type Floor } from './types';

export interface CreateBuildingInput {
  propertyId: string;
  name: string;
  description?: string;
  buildingCode?: string;
  numberOfFloors?: number;
  yearBuilt?: number;
  statusId?: string;
  latitude?: number;
  longitude?: number;
}

export type UpdateBuildingInput = Partial<CreateBuildingInput>;

export async function listBuildings(params: {
  propertyId?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<Building>> {
  const { data } = await apiClient.get<Paginated<Building>>('/buildings', { params });
  return data;
}

export async function getBuilding(id: string): Promise<Building> {
  const { data } = await apiClient.get<Building>(`/buildings/${id}`);
  return data;
}

export async function getBuildingSummary(id: string): Promise<BuildingSummary> {
  const { data } = await apiClient.get<BuildingSummary>(`/buildings/${id}/summary`);
  return data;
}

export async function createBuilding(input: CreateBuildingInput): Promise<Building> {
  const { data } = await apiClient.post<Building>('/buildings', input);
  return data;
}

export async function updateBuilding(id: string, input: UpdateBuildingInput): Promise<Building> {
  const { data } = await apiClient.patch<Building>(`/buildings/${id}`, input);
  return data;
}

export async function archiveBuilding(id: string): Promise<void> {
  await apiClient.post(`/buildings/${id}/archive`);
}

export async function restoreBuilding(id: string): Promise<Building> {
  const { data } = await apiClient.post<Building>(`/buildings/${id}/restore`);
  return data;
}

export interface CreateFloorInput {
  buildingId: string;
  name: string;
  floorNumber?: number;
  description?: string;
  sortOrder?: number;
}

export type UpdateFloorInput = Partial<Omit<CreateFloorInput, 'buildingId'>>;

export async function listFloors(buildingId: string): Promise<Floor[]> {
  const { data } = await apiClient.get<Floor[]>(`/buildings/${buildingId}/floors`);
  return data;
}

export async function createFloor(input: CreateFloorInput): Promise<Floor> {
  const { data } = await apiClient.post<Floor>('/floors', input);
  return data;
}

export async function updateFloor(id: string, input: UpdateFloorInput): Promise<Floor> {
  const { data } = await apiClient.patch<Floor>(`/floors/${id}`, input);
  return data;
}

export async function deleteFloor(id: string): Promise<void> {
  await apiClient.delete(`/floors/${id}`);
}
