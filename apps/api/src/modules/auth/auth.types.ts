/** Claims embedded in the signed access token. */
export interface JwtPayload {
  /** User id. */
  sub: string;
  /** Currently active organization id. */
  organizationId: string;
  /** Membership id for (sub, organizationId) — lets guards resolve permissions directly. */
  membershipId: string;
  email: string;
}

/** The request-attached principal, resolved by the JWT strategy. */
export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  membershipId: string;
  email: string;
}

/** Access + refresh token pair returned to clients. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
