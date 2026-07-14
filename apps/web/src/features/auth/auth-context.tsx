import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { registerAuthFailureHandler } from '../../lib/api-client';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../../lib/token-storage';

import {
  fetchProfile,
  fetchSession,
  login as loginRequest,
  logout as logoutRequest,
  registerAccount,
  switchOrganization as switchOrganizationRequest,
} from './api';
import { type AuthSession, type LoginInput, type PublicUser, type RegisterInput } from './types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: PublicUser | null;
  organizationId: string | null;
  membershipId: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(
  session: AuthSession,
  setUser: (u: PublicUser) => void,
  setIds: (organizationId: string, membershipId: string) => void,
): void {
  setTokens(session.tokens.accessToken, session.tokens.refreshToken);
  setUser(session.user);
  setIds(session.organizationId, session.membershipId);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<PublicUser | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [membershipId, setMembershipId] = useState<string | null>(null);

  const setIds = useCallback((org: string, membership: string) => {
    setOrganizationId(org);
    setMembershipId(membership);
  }, []);

  const clearLocalSession = useCallback(() => {
    clearTokens();
    setUser(null);
    setOrganizationId(null);
    setMembershipId(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    registerAuthFailureHandler(clearLocalSession);
    return () => registerAuthFailureHandler(null);
  }, [clearLocalSession]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!getAccessToken() || !getRefreshToken()) {
        setStatus('unauthenticated');
        return;
      }
      try {
        const [profile, principal] = await Promise.all([fetchProfile(), fetchSession()]);
        if (cancelled) return;
        setUser(profile);
        setIds(principal.organizationId, principal.membershipId);
        setStatus('authenticated');
      } catch {
        if (!cancelled) clearLocalSession();
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [clearLocalSession, setIds]);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await loginRequest(input);
      applySession(session, setUser, setIds);
      setStatus('authenticated');
    },
    [setIds],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await registerAccount(input);
      applySession(session, setUser, setIds);
      setStatus('authenticated');
    },
    [setIds],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } finally {
      clearLocalSession();
    }
  }, [clearLocalSession]);

  const switchOrganization = useCallback(
    async (nextOrganizationId: string) => {
      const session = await switchOrganizationRequest(nextOrganizationId);
      applySession(session, setUser, setIds);
    },
    [setIds],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      organizationId,
      membershipId,
      login,
      register,
      logout,
      switchOrganization,
    }),
    [status, user, organizationId, membershipId, login, register, logout, switchOrganization],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
