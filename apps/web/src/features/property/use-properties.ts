import { useQuery } from '@tanstack/react-query';

import { listProperties } from './api';

export function usePropertiesList(
  params: { page?: number; pageSize?: number; name?: string } = {},
) {
  return useQuery({
    queryKey: ['properties-list', params],
    queryFn: () => listProperties({ pageSize: 100, ...params }),
  });
}
