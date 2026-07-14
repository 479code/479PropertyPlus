import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archiveBuilding,
  createBuilding,
  createFloor,
  deleteFloor,
  getBuilding,
  getBuildingSummary,
  listBuildings,
  listFloors,
  restoreBuilding,
  updateBuilding,
  updateFloor,
  type CreateBuildingInput,
  type CreateFloorInput,
  type UpdateBuildingInput,
  type UpdateFloorInput,
} from './buildings-api';

export function useBuildings(params: { propertyId?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['buildings', params],
    queryFn: () => listBuildings(params),
  });
}

export function useBuilding(id: string | undefined) {
  return useQuery({
    queryKey: ['building', id],
    queryFn: () => getBuilding(id as string),
    enabled: !!id,
  });
}

export function useBuildingSummary(id: string | undefined) {
  return useQuery({
    queryKey: ['building-summary', id],
    queryFn: () => getBuildingSummary(id as string),
    enabled: !!id,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBuildingInput) => createBuilding(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}

export function useUpdateBuilding(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBuildingInput) => updateBuilding(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
      void queryClient.invalidateQueries({ queryKey: ['building', id] });
    },
  });
}

export function useArchiveBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveBuilding(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}

export function useRestoreBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreBuilding(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
  });
}

export function useFloors(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['floors', buildingId],
    queryFn: () => listFloors(buildingId as string),
    enabled: !!buildingId,
  });
}

export function useCreateFloor(buildingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateFloorInput, 'buildingId'>) =>
      createFloor({ ...input, buildingId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['floors', buildingId] });
    },
  });
}

export function useUpdateFloor(buildingId: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateFloorInput) => updateFloor(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['floors', buildingId] });
    },
  });
}

export function useDeleteFloor(buildingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFloor(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['floors', buildingId] });
    },
  });
}
