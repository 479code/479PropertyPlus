import { Injectable } from '@nestjs/common';
import { type Permission, type Prisma, type Role } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { type PermissionDef } from './permission-catalog';

/** A Prisma client or an in-flight transaction client — lets callers compose atomically. */
export type PrismaDb = PrismaService | Prisma.TransactionClient;

@Injectable()
export class RbacRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertPermissions(defs: PermissionDef[]): Promise<void> {
    for (const def of defs) {
      await this.prisma.permission.upsert({
        where: { key: def.key },
        create: {
          key: def.key,
          resource: def.resource,
          action: def.action,
          description: def.description,
        },
        update: { resource: def.resource, action: def.action, description: def.description },
      });
    }
  }

  findAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] });
  }

  findPermissionsByKeys(keys: string[]): Promise<Permission[]> {
    return this.prisma.permission.findMany({ where: { key: { in: keys } } });
  }

  createRole(
    db: PrismaDb,
    data: {
      organizationId: string;
      key: string;
      name: string;
      description: string;
      isSystem: boolean;
      createdBy?: string;
    },
  ): Promise<Role> {
    return db.role.create({ data });
  }

  linkRolePermissions(
    db: PrismaDb,
    roleId: string,
    permissionIds: string[],
  ): Promise<{ count: number }> {
    return db.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      skipDuplicates: true,
    });
  }

  listOrganizationIds(): Promise<Array<{ id: string }>> {
    return this.prisma.organization.findMany({
      where: { deletedAt: null },
      select: { id: true },
    }) as Promise<Array<{ id: string }>>;
  }

  findRoleByKey(organizationId: string, key: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { organizationId_key: { organizationId, key } } });
  }

  findRolesByOrg(organizationId: string): Promise<Role[]> {
    return this.prisma.role.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  }

  assignRole(db: PrismaDb, membershipId: string, roleId: string): Promise<{ count: number }> {
    return db.membershipRole.createMany({ data: [{ membershipId, roleId }] });
  }

  /**
   * Resolve the distinct set of permission keys granted to a membership via its
   * roles. Uses flat, index-backed queries (membership_roles → role_permissions
   * → permissions) so it is portable and easy to reason about.
   * TODO(perf): cache per membership (e.g. Redis) once request volume grows.
   */
  async getPermissionKeysForMembership(membershipId: string): Promise<string[]> {
    const membershipRoles = await this.prisma.membershipRole.findMany({ where: { membershipId } });
    const roleIds = membershipRoles.map((mr) => mr.roleId);
    if (roleIds.length === 0) return [];

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
    });
    const permissionIds = [...new Set(rolePermissions.map((rp) => rp.permissionId))];
    if (permissionIds.length === 0) return [];

    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    return [...new Set(permissions.map((perm) => perm.key))];
  }
}
