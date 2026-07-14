import { apiClient } from '../../lib/api-client';

import { type PropertyInventorySummary } from './types';

export async function getPropertyInventorySummary(
  propertyId: string,
): Promise<PropertyInventorySummary> {
  const { data } = await apiClient.get<PropertyInventorySummary>(
    `/properties/${propertyId}/inventory-summary`,
  );
  return data;
}
