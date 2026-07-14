import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

import {
  getAgentProfile,
  getOwnerProfile,
  getTenantProfile,
  removeAgentProfile,
  removeOwnerProfile,
  removeTenantProfile,
  upsertAgentProfile,
  upsertOwnerProfile,
  upsertTenantProfile,
  type AgentProfileInput,
  type OwnerProfileInput,
  type TenantProfileInput,
} from './profile-api';
import { type AgentProfile, type OwnerProfile, type TenantProfile } from './types';

async function orNullOn404<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if ((error as AxiosError)?.response?.status === 404) return null;
    throw error;
  }
}

export function useTenantProfile(personId: string | undefined) {
  return useQuery<TenantProfile | null>({
    queryKey: ['tenant-profile', personId],
    queryFn: () => orNullOn404(() => getTenantProfile(personId as string)),
    enabled: !!personId,
  });
}
export function useUpsertTenantProfile(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantProfileInput) => upsertTenantProfile(personId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant-profile', personId] });
      void queryClient.invalidateQueries({ queryKey: ['person', personId] });
    },
  });
}
export function useRemoveTenantProfile(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeTenantProfile(personId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant-profile', personId] });
      void queryClient.invalidateQueries({ queryKey: ['person', personId] });
    },
  });
}

export function useAgentProfile(personId: string | undefined) {
  return useQuery<AgentProfile | null>({
    queryKey: ['agent-profile', personId],
    queryFn: () => orNullOn404(() => getAgentProfile(personId as string)),
    enabled: !!personId,
  });
}
export function useUpsertAgentProfile(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgentProfileInput) => upsertAgentProfile(personId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['agent-profile', personId] }),
  });
}
export function useRemoveAgentProfile(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeAgentProfile(personId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['agent-profile', personId] }),
  });
}

export function useOwnerProfile(personId: string | undefined) {
  return useQuery<OwnerProfile | null>({
    queryKey: ['owner-profile', personId],
    queryFn: () => orNullOn404(() => getOwnerProfile(personId as string)),
    enabled: !!personId,
  });
}
export function useUpsertOwnerProfile(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OwnerProfileInput) => upsertOwnerProfile(personId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['owner-profile', personId] }),
  });
}
export function useRemoveOwnerProfile(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeOwnerProfile(personId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['owner-profile', personId] }),
  });
}
