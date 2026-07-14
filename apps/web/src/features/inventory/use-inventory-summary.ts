import { useQuery } from '@tanstack/react-query';

import { getPropertyInventorySummary } from './summary-api';

export function usePropertyInventorySummary(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['property-inventory-summary', propertyId],
    queryFn: () => getPropertyInventorySummary(propertyId as string),
    enabled: !!propertyId,
  });
}
