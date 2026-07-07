import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { type Reflector } from '@nestjs/core';

import { type RbacService } from '../../modules/rbac/rbac.service';

import { PermissionsGuard } from './permissions.guard';

function contextFor(user: unknown): ExecutionContext {
  return {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function build(required: string[] | undefined, granted: string[]): { guard: PermissionsGuard } {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(required),
  } as unknown as Reflector;
  const rbac = {
    getPermissionKeysForMembership: jest.fn().mockResolvedValue(granted),
  } as unknown as RbacService;
  return { guard: new PermissionsGuard(reflector, rbac) };
}

const principal = { userId: 'u1', organizationId: 'o1', membershipId: 'm1', email: 'u@x.com' };

describe('PermissionsGuard', () => {
  it('allows routes with no permission requirement', async () => {
    const { guard } = build(undefined, []);
    await expect(guard.canActivate(contextFor(principal))).resolves.toBe(true);
  });

  it('allows when the membership holds every required permission', async () => {
    const { guard } = build(
      ['property:read', 'property:update'],
      ['property:read', 'property:update', 'x:y'],
    );
    await expect(guard.canActivate(contextFor(principal))).resolves.toBe(true);
  });

  it('forbids when a required permission is missing', async () => {
    const { guard } = build(['property:delete'], ['property:read']);
    await expect(guard.canActivate(contextFor(principal))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('forbids when there is no authenticated principal', async () => {
    const { guard } = build(['property:read'], []);
    await expect(guard.canActivate(contextFor(undefined))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
