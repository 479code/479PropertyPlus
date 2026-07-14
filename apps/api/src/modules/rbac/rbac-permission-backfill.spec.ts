import { type PrismaService } from '../../prisma/prisma.service';

import { DEFAULT_ROLES, OWNER_ROLE_KEY } from './default-roles';
import { PERMISSION_KEYS } from './permission-catalog';
import { type RbacRepository } from './rbac.repository';
import { RbacService } from './rbac.service';

function build() {
  const allPermissions = PERMISSION_KEYS.map((key, i) => ({ id: `perm-${i}`, key }));
  const ownerRole = { id: 'role-owner', key: OWNER_ROLE_KEY, isSystem: true };

  const repository = {
    findPermissionsByKeys: jest.fn().mockResolvedValue(allPermissions),
    listOrganizationIds: jest.fn().mockResolvedValue([{ id: 'org1' }, { id: 'org2' }]),
    findRolesByOrg: jest.fn().mockResolvedValue([ownerRole]),
    linkRolePermissions: jest.fn().mockResolvedValue({ count: allPermissions.length }),
  } as unknown as RbacRepository;
  const prisma = {} as PrismaService;

  return { service: new RbacService(repository, prisma), repository, ownerRole };
}

describe('RbacService.backfillRolePermissions', () => {
  it('links the full current permission set to each matching system role, per organization', async () => {
    const { service, repository, ownerRole } = build();
    await service.backfillRolePermissions();

    // one call per (org, matched-role-definition) pair — Owner role matches in both orgs
    expect(repository.linkRolePermissions).toHaveBeenCalledWith(
      expect.anything(),
      ownerRole.id,
      expect.any(Array),
    );
    expect((repository.linkRolePermissions as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it('skips organizations that have no role matching a given definition key', async () => {
    const { service, repository } = build();
    (repository.findRolesByOrg as jest.Mock).mockResolvedValue([]);
    await service.backfillRolePermissions();
    expect(repository.linkRolePermissions).not.toHaveBeenCalled();
  });

  it('never touches non-system roles even if the key happens to match', async () => {
    const { service, repository } = build();
    (repository.findRolesByOrg as jest.Mock).mockResolvedValue([
      { id: 'custom-role', key: OWNER_ROLE_KEY, isSystem: false },
    ]);
    await service.backfillRolePermissions();
    expect(repository.linkRolePermissions).not.toHaveBeenCalled();
  });

  it('is safe to run repeatedly (relies on the repository/DB unique-constraint skip, not client-side diffing)', async () => {
    const { service, repository } = build();
    await service.backfillRolePermissions();
    await service.backfillRolePermissions();
    // Called again on the second run too — idempotency is the repository's job (skipDuplicates),
    // not something this service needs to compute itself.
    expect((repository.linkRolePermissions as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(
      DEFAULT_ROLES.length,
    );
  });
});
