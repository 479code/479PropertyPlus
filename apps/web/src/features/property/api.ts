import { apiClient } from '../../lib/api-client';

export interface PropertyRef {
  id: string;
  name: string;
  propertyCode: string;
  slug: string;
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Fetches a page of properties for use in select dropdowns (buildings/units forms). */
export async function listProperties(
  params: { page?: number; pageSize?: number; name?: string } = {},
): Promise<Paginated<PropertyRef>> {
  const { data } = await apiClient.get<Paginated<PropertyRef>>('/properties', { params });
  return data;
}
