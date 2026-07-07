import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { type AuthenticatedUser } from '../../modules/auth/auth.types';

/**
 * Resolves the active organization from the authenticated JWT principal
 * (populated by JwtStrategy). Replaces the earlier `x-organization-id` header
 * shim — organization context is now bound to the access token and switched via
 * POST /organizations/switch.
 */
export const OrgId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
  const orgId = request.user?.organizationId;
  if (!orgId) {
    throw new UnauthorizedException('No active organization on the authenticated session');
  }
  return orgId;
});

/** Resolves the acting user id from the authenticated JWT principal. */
export const ActorId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    return request.user?.userId;
  },
);
