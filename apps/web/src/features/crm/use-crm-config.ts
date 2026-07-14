import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import {
  createPersonTag,
  createPersonType,
  deletePersonTag,
  deletePersonType,
  listPersonTags,
  listPersonTypes,
  updatePersonTag,
  updatePersonType,
  type PersonTagInput,
  type PersonTypeInput,
} from './support-api';
import { type PersonTag, type PersonType } from './types';

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

export const personTypeHooks = makeConfigHooks<PersonType, PersonTypeInput>('person-types', {
  list: listPersonTypes,
  create: createPersonType,
  update: updatePersonType,
  remove: deletePersonType,
});

export const personTagHooks = makeConfigHooks<PersonTag, PersonTagInput>('person-tags', {
  list: listPersonTags,
  create: createPersonTag,
  update: updatePersonTag,
  remove: deletePersonTag,
});
