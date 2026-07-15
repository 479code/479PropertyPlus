import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addLeaseDocument,
  addLeaseGuarantor,
  addLeaseNote,
  addLeaseTenant,
  getLeaseDashboard,
  listLeaseDocuments,
  listLeaseGuarantors,
  listLeaseNotes,
  listLeaseTenants,
  listLeaseTimeline,
  removeLeaseDocument,
  removeLeaseGuarantor,
  removeLeaseNote,
  removeLeaseTenant,
  type LeaseDocumentInput,
  type LeaseGuarantorInput,
  type LeaseTenantInput,
} from './lease-support-api';

// ── Tenants ──
export function useLeaseTenants(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['lease-tenants', leaseId],
    queryFn: () => listLeaseTenants(leaseId as string),
    enabled: !!leaseId,
  });
}
export function useAddLeaseTenant(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaseTenantInput) => addLeaseTenant(leaseId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lease-tenants', leaseId] }),
  });
}
export function useRemoveLeaseTenant(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeLeaseTenant(leaseId, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lease-tenants', leaseId] }),
  });
}

// ── Guarantors ──
export function useLeaseGuarantors(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['lease-guarantors', leaseId],
    queryFn: () => listLeaseGuarantors(leaseId as string),
    enabled: !!leaseId,
  });
}
export function useAddLeaseGuarantor(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaseGuarantorInput) => addLeaseGuarantor(leaseId, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['lease-guarantors', leaseId] }),
  });
}
export function useRemoveLeaseGuarantor(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeLeaseGuarantor(leaseId, id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['lease-guarantors', leaseId] }),
  });
}

// ── Documents ──
export function useLeaseDocuments(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['lease-documents', leaseId],
    queryFn: () => listLeaseDocuments(leaseId as string),
    enabled: !!leaseId,
  });
}
export function useAddLeaseDocument(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeaseDocumentInput) => addLeaseDocument(leaseId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lease-documents', leaseId] }),
  });
}
export function useRemoveLeaseDocument(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeLeaseDocument(leaseId, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lease-documents', leaseId] }),
  });
}

// ── Timeline ──
export function useLeaseTimeline(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['lease-timeline', leaseId],
    queryFn: () => listLeaseTimeline(leaseId as string),
    enabled: !!leaseId,
  });
}

// ── Notes ──
export function useLeaseNotes(leaseId: string | undefined) {
  return useQuery({
    queryKey: ['lease-notes', leaseId],
    queryFn: () => listLeaseNotes(leaseId as string),
    enabled: !!leaseId,
  });
}
export function useAddLeaseNote(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => addLeaseNote(leaseId, note),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lease-notes', leaseId] }),
  });
}
export function useRemoveLeaseNote(leaseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeLeaseNote(leaseId, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lease-notes', leaseId] }),
  });
}

// ── Dashboard ──
export function useLeaseDashboard() {
  return useQuery({ queryKey: ['lease-dashboard'], queryFn: getLeaseDashboard });
}
