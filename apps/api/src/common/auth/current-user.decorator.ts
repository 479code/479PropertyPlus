import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { type AuthenticatedUser } from '../../modules/auth/auth.types';

/**
 * Resolves the authenticated principal attached to the request by the JWT
 * strategy. Optionally projects a single field: `@CurrentUser('userId')`.
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return data ? request.user[data] : request.user;
  },
);
