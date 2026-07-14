import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archiveUnit,
  createUnit,
  getUnit,
  getUnitOccupancyHistory,
  getUnitTimeline,
  restoreUnit,
  searchUnits,
  updateUnit,
  type CreateUnitInput,
  type SearchUnitsParams,
  type UpdateUnitInput,
} from './units-api';

export function useUnits(params: SearchUnitsParams) {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => searchUnits(params),
  });
}

export function useUnit(id: string | undefined) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => getUnit(id as string),
    enabled: !!id,
  });
}

export function useUnitTimeline(id: string | undefined) {
  return useQuery({
    queryKey: ['unit-timeline', id],
    queryFn: () => getUnitTimeline(id as string),
    enabled: !!id,
  });
}

export function useUnitOccupancyHistory(id: string | undefined) {
  return useQuery({
    queryKey: ['unit-occupancy-history', id],
    queryFn: () => getUnitOccupancyHistory(id as string),
    enabled: !!id,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUnitInput) => createUnit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['units'] });
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}

export function useUpdateUnit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUnitInput) => updateUnit(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['units'] });
      void queryClient.invalidateQueries({ queryKey: ['unit', id] });
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}

export function useArchiveUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['units'] });
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}

export function useRestoreUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['units'] });
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}
