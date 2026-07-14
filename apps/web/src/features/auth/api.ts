import { apiClient } from '../../lib/api-client';

import {
  type AuthSession,
  type AuthenticatedPrincipal,
  type LoginInput,
  type Membership,
  type PublicUser,
  type RegisterInput,
} from './types';

export async function registerAccount(input: RegisterInput): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/auth/register', input);
  return data;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/auth/login', input);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function fetchSession(): Promise<AuthenticatedPrincipal> {
  const { data } = await apiClient.get<AuthenticatedPrincipal>('/auth/session');
  return data;
}

export async function fetchProfile(): Promise<PublicUser> {
  const { data } = await apiClient.get<PublicUser>('/me');
  return data;
}

export async function fetchMemberships(): Promise<Membership[]> {
  const { data } = await apiClient.get<Membership[]>('/me/memberships');
  return data;
}

export async function switchOrganization(organizationId: string): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/organizations/switch', { organizationId });
  return data;
}
