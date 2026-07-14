import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addContactHistory,
  addEmergencyContact,
  addPersonDocument,
  getCrmDashboard,
  listContactHistory,
  listEmergencyContacts,
  listPersonDocuments,
  removeContactHistory,
  removeEmergencyContact,
  removePersonDocument,
  updateEmergencyContact,
  type ContactHistoryInput,
  type EmergencyContactInput,
  type PersonDocumentInput,
} from './support-api';

// ── Emergency contacts ──
export function useEmergencyContacts(personId: string | undefined) {
  return useQuery({
    queryKey: ['emergency-contacts', personId],
    queryFn: () => listEmergencyContacts(personId as string),
    enabled: !!personId,
  });
}
export function useAddEmergencyContact(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmergencyContactInput) => addEmergencyContact(personId, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['emergency-contacts', personId] }),
  });
}
export function useUpdateEmergencyContact(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmergencyContactInput> }) =>
      updateEmergencyContact(personId, id, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['emergency-contacts', personId] }),
  });
}
export function useRemoveEmergencyContact(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeEmergencyContact(personId, id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['emergency-contacts', personId] }),
  });
}

// ── Documents ──
export function usePersonDocuments(personId: string | undefined) {
  return useQuery({
    queryKey: ['person-documents', personId],
    queryFn: () => listPersonDocuments(personId as string),
    enabled: !!personId,
  });
}
export function useAddPersonDocument(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PersonDocumentInput) => addPersonDocument(personId, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['person-documents', personId] }),
  });
}
export function useRemovePersonDocument(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removePersonDocument(personId, id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['person-documents', personId] }),
  });
}

// ── Contact history ──
export function useContactHistory(personId: string | undefined) {
  return useQuery({
    queryKey: ['contact-history', personId],
    queryFn: () => listContactHistory(personId as string),
    enabled: !!personId,
  });
}
export function useAddContactHistory(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ContactHistoryInput) => addContactHistory(personId, input),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['contact-history', personId] }),
  });
}
export function useRemoveContactHistory(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeContactHistory(personId, id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['contact-history', personId] }),
  });
}

// ── Dashboard ──
export function useCrmDashboard() {
  return useQuery({ queryKey: ['crm-dashboard'], queryFn: getCrmDashboard });
}
