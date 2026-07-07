import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { type AuthenticatedUser } from '../../modules/auth/auth.types';
import { RbacService } from '../../modules/rbac/rbac.service';

import { PERMISSIONS_KEY } from './require-permissions.decorator';

/**
 * Applied globally, after {@link JwtAuthGuard}. Routes without
 * {@link RequirePermissions} pass through (authentication alone suffices).
 * Otherwise the caller's active-organization membership must hold every listed
 * permission key.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const granted = new Set(await this.rbac.getPermissionKeysForMembership(user.membershipId));
    const missing = required.filter((key) => !granted.has(key));
    if (missing.length > 0) {
      throw new ForbiddenException(`Missing required permission(s): ${missing.join(', ')}`);
    }
    return true;
  }
}
