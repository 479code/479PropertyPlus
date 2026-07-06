import { BadRequestException, createParamDecorator, type ExecutionContext } from '@nestjs/common';

/**
 * INTERIM tenant resolution until the auth/JWT module lands.
 * Resolves the active organization from the `x-organization-id` header.
 * TODO(auth): replace with organizationId derived from the authenticated JWT.
 */
export const OrgId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
  const orgId = request.headers['x-organization-id'];
  if (!orgId || typeof orgId !== 'string') {
    throw new BadRequestException('Missing required header: x-organization-id');
  }
  return orgId;
});

/**
 * INTERIM actor resolution. Resolves the acting user from `x-user-id` (optional).
 * TODO(auth): replace with userId derived from the authenticated JWT.
 */
export const ActorId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const userId = request.headers['x-user-id'];
    return typeof userId === 'string' ? userId : undefined;
  },
);
