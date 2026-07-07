import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'requiredPermissions';

/**
 * Declares the fine-grained permission keys (e.g. `property:create`) a caller's
 * active-organization membership must hold. Multiple keys are ALL required (AND).
 * Enforced by {@link PermissionsGuard}.
 */
export const RequirePermissions = (...permissions: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
