import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPersonTag,
  archivePerson,
  createPerson,
  getPerson,
  removePersonTag,
  restorePerson,
  searchPeople,
  updatePerson,
  type CreatePersonInput,
  type SearchPeopleParams,
  type UpdatePersonInput,
} from './person-api';

export function usePeople(params: SearchPeopleParams) {
  return useQuery({
    queryKey: ['people', params],
    queryFn: () => searchPeople(params),
  });
}

export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: ['person', id],
    queryFn: () => getPerson(id as string),
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePersonInput) => createPerson(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useUpdatePerson(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePersonInput) => updatePerson(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['people'] });
      void queryClient.invalidateQueries({ queryKey: ['person', id] });
    },
  });
}

export function useArchivePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archivePerson(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useRestorePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restorePerson(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['people'] }),
  });
}

export function useAddPersonTag(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => addPersonTag(personId, tagId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['person', personId] }),
  });
}

export function useRemovePersonTag(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => removePersonTag(personId, tagId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['person', personId] }),
  });
}
