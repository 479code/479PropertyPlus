import { QueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        // Don't retry client errors (bad request, not found, forbidden, etc.) —
        // only transient/network/server failures are worth a retry.
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
