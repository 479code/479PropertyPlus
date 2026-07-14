export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: PublicUser;
  organizationId: string;
  membershipId: string;
  tokens: TokenPair;
}

export interface AuthenticatedPrincipal {
  userId: string;
  organizationId: string;
  membershipId: string;
  email: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  organizationName: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
