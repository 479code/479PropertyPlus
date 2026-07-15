import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  activateLease,
  approveLease,
  archiveLease,
  completeRenewal,
  createLease,
  getLease,
  initiateRenewal,
  rejectLease,
  rejectRenewal,
  restoreLease,
  searchLeases,
  submitLease,
  terminateLease,
  updateLease,
  type CreateLeaseInput,
  type SearchLeasesParams,
  type UpdateLeaseInput,
} from './lease-api';

export function useLeases(params: SearchLeasesParams) {
  return useQuery({ queryKey: ['leases', params], queryFn: () => searchLeases(params) });
}

export function useLease(id: string | undefined) {
  return useQuery({
    queryKey: ['lease', id],
    queryFn: () => getLease(id as string),
    enabled: !!id,
  });
}

function useLeaseMutation<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<unknown>,
  invalidateId?: (args: TArgs) => string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: TArgs) => fn(...args),
    onSuccess: (_data, args) => {
      void queryClient.invalidateQueries({ queryKey: ['leases'] });
      void queryClient.invalidateQueries({ queryKey: ['lease-dashboard'] });
      const id = invalidateId ? invalidateId(args) : (args[0] as string);
      if (id) void queryClient.invalidateQueries({ queryKey: ['lease', id] });
    },
  });
}

export function useCreateLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeaseInput) => createLease(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leases'] });
      void queryClient.invalidateQueries({ queryKey: ['lease-dashboard'] });
    },
  });
}

export function useUpdateLease(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLeaseInput) => updateLease(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leases'] });
      void queryClient.invalidateQueries({ queryKey: ['lease', id] });
    },
  });
}

export function useSubmitLease() {
  return useLeaseMutation((id: string) => submitLease(id));
}
export function useApproveLease() {
  return useLeaseMutation((id: string) => approveLease(id));
}
export function useRejectLease() {
  return useLeaseMutation((id: string, reason?: string) => rejectLease(id, reason));
}
export function useActivateLease() {
  return useLeaseMutation((id: string) => activateLease(id));
}
export function useInitiateRenewal() {
  return useLeaseMutation((id: string) => initiateRenewal(id));
}
export function useCompleteRenewal() {
  return useLeaseMutation((id: string, newEndDate: string) => completeRenewal(id, newEndDate));
}
export function useRejectRenewal() {
  return useLeaseMutation((id: string) => rejectRenewal(id));
}
export function useTerminateLease() {
  return useLeaseMutation((id: string, terminationDate: string, terminationReason: string) =>
    terminateLease(id, terminationDate, terminationReason),
  );
}
export function useArchiveLease() {
  return useLeaseMutation((id: string) => archiveLease(id));
}
export function useRestoreLease() {
  return useLeaseMutation((id: string) => restoreLease(id));
}
