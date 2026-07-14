import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addUnitDocument,
  addUnitImage,
  listUnitDocuments,
  listUnitImages,
  removeUnitDocument,
  removeUnitImage,
  type UnitDocumentInput,
  type UnitImageInput,
} from './media-api';

export function useUnitImages(unitId: string | undefined) {
  return useQuery({
    queryKey: ['unit-images', unitId],
    queryFn: () => listUnitImages(unitId as string),
    enabled: !!unitId,
  });
}

export function useAddUnitImage(unitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UnitImageInput) => addUnitImage(unitId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['unit-images', unitId] }),
  });
}

export function useRemoveUnitImage(unitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeUnitImage(unitId, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['unit-images', unitId] }),
  });
}

export function useUnitDocuments(unitId: string | undefined) {
  return useQuery({
    queryKey: ['unit-documents', unitId],
    queryFn: () => listUnitDocuments(unitId as string),
    enabled: !!unitId,
  });
}

export function useAddUnitDocument(unitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UnitDocumentInput) => addUnitDocument(unitId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['unit-documents', unitId] }),
  });
}

export function useRemoveUnitDocument(unitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeUnitDocument(unitId, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['unit-documents', unitId] }),
  });
}
