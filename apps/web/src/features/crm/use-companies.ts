import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany,
  type CompanyInput,
} from './company-api';

export function useCompanies(params: { name?: string; page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => listCompanies(params),
  });
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompany(id as string),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyInput) => createCompany(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}

export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CompanyInput>) => updateCompany(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companies'] });
      void queryClient.invalidateQueries({ queryKey: ['company', id] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}
