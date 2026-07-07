import { Injectable, Logger } from '@nestjs/common';
import { type Permission, type Role } from '@prisma/client';

import { DEFAULT_ROLES, OWNER_ROLE_KEY } from './default-roles';
import { PERMISSION_CATALOG, PERMISSION_KEYS } from './permission-catalog';
import { type PrismaDb, RbacRepository } from './rbac.repository';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(private readonly repository: RbacRepository) {}

  /** Idempotently ensure the global permission catalog exists. */
  async seedPermissionCatalog(): Promise<void> {
    await this.repository.upsertPermissions(PERMISSION_CATALOG);
    this.logger.log(`Permission catalog ensured (${PERMISSION_CATALOG.length} permissions)`);
  }

  listPermissions(): Promise<Permission[]> {
    return this.repository.findAllPermissions();
  }

  listRoles(organizationId: string): Promise<Role[]> {
    return this.repository.findRolesByOrg(organizationId);
  }

  findRoleByKey(organizationId: string, key: string): Promise<Role | null> {
    return this.repository.findRoleByKey(organizationId, key);
  }

  getPermissionKeysForMembership(membershipId: string): Promise<string[]> {
    return this.repository.getPermissionKeysForMembership(membershipId);
  }

  assignRole(db: PrismaDb, membershipId: string, roleId: string): Promise<{ count: number }> {
    return this.repository.assignRole(db, membershipId, roleId);
  }

  /**
   * Create the default system roles for a freshly-created organization and wire
   * each to its permission set. Runs inside the caller's transaction so signup
   * is atomic. Returns the Owner role, ready to assign to the founding member.
   * Assumes {@link seedPermissionCatalog} has already run.
   */
  async provisionOrganizationRoles(
    db: PrismaDb,
    organizationId: string,
    createdBy?: string,
  ): Promise<Role> {
    const allPermissions = await this.repository.findPermissionsByKeys(PERMISSION_KEYS);
    const idByKey = new Map(allPermissions.map((perm) => [perm.key, perm.id]));

    let ownerRole: Role | undefined;
    for (const def of DEFAULT_ROLES) {
      const role = await this.repository.createRole(db, {
        organizationId,
        key: def.key,
        name: def.name,
        description: def.description,
        isSystem: true,
        createdBy,
      });

      const keys = def.permissions === '*' ? PERMISSION_KEYS : def.permissions;
      const permissionIds = keys
        .map((key) => idByKey.get(key))
        .filter((id): id is string => typeof id === 'string');
      if (permissionIds.length > 0) {
        await this.repository.linkRolePermissions(db, role.id, permissionIds);
      }

      if (def.key === OWNER_ROLE_KEY) ownerRole = role;
    }

    if (!ownerRole) {
      throw new Error('Owner role definition missing from DEFAULT_ROLES');
    }
    return ownerRole;
  }
}
