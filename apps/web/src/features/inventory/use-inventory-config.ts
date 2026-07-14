import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import {
  createBuildingStatus,
  createUnitFeature,
  createUnitStatus,
  createUnitType,
  deleteBuildingStatus,
  deleteUnitFeature,
  deleteUnitStatus,
  deleteUnitType,
  listBuildingStatuses,
  listUnitFeatures,
  listUnitStatuses,
  listUnitTypes,
  updateBuildingStatus,
  updateUnitFeature,
  updateUnitStatus,
  updateUnitType,
  type BuildingStatusInput,
  type UnitFeatureInput,
  type UnitStatusInput,
  type UnitTypeInput,
} from './config-api';
import { type BuildingStatus, type UnitFeature, type UnitStatus, type UnitType } from './types';

function makeConfigHooks<TEntity, TInput>(
  key: string,
  api: {
    list: () => Promise<TEntity[]>;
    create: (input: TInput) => Promise<TEntity>;
    update: (id: string, input: Partial<TInput>) => Promise<TEntity>;
    remove: (id: string) => Promise<void>;
  },
) {
  function useList() {
    return useQuery({ queryKey: [key], queryFn: api.list });
  }

  function useCreate(): UseMutationResult<TEntity, unknown, TInput> {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.create,
      onSuccess: () => void queryClient.invalidateQueries({ queryKey: [key] }),
    });
  }

  function useUpdate(): UseMutationResult<
    TEntity,
    unknown,
    { id: string; input: Partial<TInput> }
  > {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }) => api.update(id, input),
      onSuccess: () => void queryClient.invalidateQueries({ queryKey: [key] }),
    });
  }

  function useRemove(): UseMutationResult<void, unknown, string> {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: api.remove,
      onSuccess: () => void queryClient.invalidateQueries({ queryKey: [key] }),
    });
  }

  return { useList, useCreate, useUpdate, useRemove };
}

export const buildingStatusHooks = makeConfigHooks<BuildingStatus, BuildingStatusInput>(
  'building-statuses',
  {
    list: listBuildingStatuses,
    create: createBuildingStatus,
    update: updateBuildingStatus,
    remove: deleteBuildingStatus,
  },
);

export const unitTypeHooks = makeConfigHooks<UnitType, UnitTypeInput>('unit-types', {
  list: listUnitTypes,
  create: createUnitType,
  update: updateUnitType,
  remove: deleteUnitType,
});

export const unitStatusHooks = makeConfigHooks<UnitStatus, UnitStatusInput>('unit-statuses', {
  list: listUnitStatuses,
  create: createUnitStatus,
  update: updateUnitStatus,
  remove: deleteUnitStatus,
});

export const unitFeatureHooks = makeConfigHooks<UnitFeature, UnitFeatureInput>('unit-features', {
  list: listUnitFeatures,
  create: createUnitFeature,
  update: updateUnitFeature,
  remove: deleteUnitFeature,
});
