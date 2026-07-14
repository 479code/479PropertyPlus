import { apiClient } from '../../lib/api-client';

import { type UnitDocument, type UnitDocumentType, type UnitImage } from './types';

export interface UnitImageInput {
  url: string;
  caption?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface UnitDocumentInput {
  documentType: UnitDocumentType;
  name: string;
  url: string;
  description?: string;
}

export async function listUnitImages(unitId: string): Promise<UnitImage[]> {
  const { data } = await apiClient.get<UnitImage[]>(`/units/${unitId}/images`);
  return data;
}
export async function addUnitImage(unitId: string, input: UnitImageInput): Promise<UnitImage> {
  const { data } = await apiClient.post<UnitImage>(`/units/${unitId}/images`, input);
  return data;
}
export async function updateUnitImage(
  unitId: string,
  id: string,
  input: Partial<UnitImageInput>,
): Promise<UnitImage> {
  const { data } = await apiClient.patch<UnitImage>(`/units/${unitId}/images/${id}`, input);
  return data;
}
export async function removeUnitImage(unitId: string, id: string): Promise<void> {
  await apiClient.delete(`/units/${unitId}/images/${id}`);
}

export async function listUnitDocuments(unitId: string): Promise<UnitDocument[]> {
  const { data } = await apiClient.get<UnitDocument[]>(`/units/${unitId}/documents`);
  return data;
}
export async function addUnitDocument(
  unitId: string,
  input: UnitDocumentInput,
): Promise<UnitDocument> {
  const { data } = await apiClient.post<UnitDocument>(`/units/${unitId}/documents`, input);
  return data;
}
export async function updateUnitDocument(
  unitId: string,
  id: string,
  input: Partial<UnitDocumentInput>,
): Promise<UnitDocument> {
  const { data } = await apiClient.patch<UnitDocument>(`/units/${unitId}/documents/${id}`, input);
  return data;
}
export async function removeUnitDocument(unitId: string, id: string): Promise<void> {
  await apiClient.delete(`/units/${unitId}/documents/${id}`);
}
