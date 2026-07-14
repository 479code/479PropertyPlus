import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './token-storage';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({ baseURL: API_BASE_URL });

/** Raw, uninstrumented client used only for the refresh call itself, so it never re-enters the 401 interceptor below. */
const refreshClient = axios.create({ baseURL: API_BASE_URL });

/**
 * Invoked when a refresh attempt fails (refresh token expired/revoked). The
 * AuthProvider registers a handler here on mount so the interceptor — which
 * lives outside React — can trigger a clean logout + redirect to /login.
 */
let onAuthFailure: (() => void) | null = null;
export function registerAuthFailureHandler(handler: (() => void) | null): void {
  onAuthFailure = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const { data } = await refreshClient.post<{
    tokens: { accessToken: string; refreshToken: string };
  }>('/auth/refresh', { refreshToken });
  setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return data.tokens.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh');

    if (status !== 401 || !original || original._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise ??= performRefresh().finally(() => {
        refreshPromise = null;
      });
      const accessToken = await refreshPromise;
      original.headers.set('Authorization', `Bearer ${accessToken}`);
      return apiClient.request(original);
    } catch (refreshError) {
      clearTokens();
      onAuthFailure?.();
      return Promise.reject(refreshError);
    }
  },
);
