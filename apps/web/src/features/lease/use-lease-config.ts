import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import {
  createLeaseType,
  createPaymentFrequency,
  deleteLeaseType,
  deletePaymentFrequency,
  listLeaseStatuses,
  listLeaseTypes,
  listPaymentFrequencies,
  updateLeaseStatus,
  updateLeaseType,
  updatePaymentFrequency,
  type LeaseStatusUpdateInput,
  type NamedConfigInput,
} from './lease-config-api';
import { type LeaseType, type PaymentFrequency } from './types';

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

export const leaseTypeHooks = makeConfigHooks<LeaseType, NamedConfigInput>('lease-types', {
  list: listLeaseTypes,
  create: createLeaseType,
  update: updateLeaseType,
  remove: deleteLeaseType,
});

export const paymentFrequencyHooks = makeConfigHooks<PaymentFrequency, NamedConfigInput>(
  'payment-frequencies',
  {
    list: listPaymentFrequencies,
    create: createPaymentFrequency,
    update: updatePaymentFrequency,
    remove: deletePaymentFrequency,
  },
);

export function useLeaseStatuses() {
  return useQuery({ queryKey: ['lease-statuses'], queryFn: listLeaseStatuses });
}

export function useUpdateLeaseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: LeaseStatusUpdateInput }) =>
      updateLeaseStatus(id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lease-statuses'] }),
  });
}
