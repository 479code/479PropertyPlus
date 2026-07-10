import { ConflictException } from '@nestjs/common';

import { type PrismaService } from '../../../prisma/prisma.service';
import { type AuditService } from '../../audit/audit.service';

import {
  DEFAULT_BUILDING_STATUSES,
  DEFAULT_UNIT_FEATURES,
  DEFAULT_UNIT_STATUSES,
  DEFAULT_UNIT_TYPES,
} from './default-inventory-config';
import { type InventoryConfigRepository } from './inventory-config.repository';
import { InventoryConfigService } from './inventory-config.service';

function build(
  countsOverride: Partial<
    Record<'buildingStatuses' | 'unitTypes' | 'unitStatuses' | 'unitFeatures', number>
  > = {},
) {
  const counts = {
    buildingStatuses: 0,
    unitTypes: 0,
    unitStatuses: 0,
    unitFeatures: 0,
    ...countsOverride,
  };
  const repository = {
    findBuildingStatusByName: jest.fn().mockResolvedValue(null),
    createBuildingStatus: jest.fn().mockResolvedValue({ id: 'bs' }),
    findUnitTypeByName: jest.fn().mockResolvedValue(null),
    createUnitType: jest.fn().mockResolvedValue({ id: 'ut' }),
    findUnitStatusByName: jest.fn().mockResolvedValue(null),
    createUnitStatus: jest.fn().mockResolvedValue({ id: 'us' }),
    findUnitFeatureByName: jest.fn().mockResolvedValue(null),
    createUnitFeature: jest.fn().mockResolvedValue({ id: 'uf' }),
    countBuildingStatuses: jest.fn().mockResolvedValue(counts.buildingStatuses),
    countUnitTypes: jest.fn().mockResolvedValue(counts.unitTypes),
    countUnitStatuses: jest.fn().mockResolvedValue(counts.unitStatuses),
    countUnitFeatures: jest.fn().mockResolvedValue(counts.unitFeatures),
    listOrganizationIds: jest.fn().mockResolvedValue([{ id: 'org1' }, { id: 'org2' }]),
  } as unknown as InventoryConfigRepository;
  const audit = { record: jest.fn() } as unknown as AuditService;
  const prisma = {} as PrismaService;
  return { service: new InventoryConfigService(repository, prisma, audit), repository };
}

describe('InventoryConfigService', () => {
  it('rejects a duplicate building status name', async () => {
    const { service, repository } = build();
    (repository.findBuildingStatusByName as jest.Mock).mockResolvedValue({ id: 'existing' });
    await expect(
      service.createBuildingStatus('org1', { name: 'Active' }, 'u1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  describe('seedDefaults', () => {
    it('seeds every default category for a brand-new (empty) organization', async () => {
      const { service, repository } = build();
      await service.seedDefaults({} as never, 'org1', 'u1');
      expect((repository.createBuildingStatus as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_BUILDING_STATUSES.length,
      );
      expect((repository.createUnitType as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_UNIT_TYPES.length,
      );
      expect((repository.createUnitStatus as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_UNIT_STATUSES.length,
      );
      expect((repository.createUnitFeature as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_UNIT_FEATURES.length,
      );
    });

    it('is idempotent: skips categories that already have rows', async () => {
      const { service, repository } = build({
        buildingStatuses: 3,
        unitTypes: DEFAULT_UNIT_TYPES.length,
        unitStatuses: 0,
        unitFeatures: 5,
      });
      await service.seedDefaults({} as never, 'org1', 'u1');
      expect(repository.createBuildingStatus).not.toHaveBeenCalled();
      expect(repository.createUnitType).not.toHaveBeenCalled();
      expect((repository.createUnitStatus as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_UNIT_STATUSES.length,
      );
      expect(repository.createUnitFeature).not.toHaveBeenCalled();
    });
  });

  describe('backfillAll', () => {
    it('runs seedDefaults for every existing organization, safe to run repeatedly', async () => {
      const { service, repository } = build();
      await service.backfillAll();
      expect(repository.listOrganizationIds).toHaveBeenCalled();
      // 2 orgs x 4 categories each fully seeded (counts start at 0 every call in this mock)
      expect((repository.createBuildingStatus as jest.Mock).mock.calls.length).toBe(
        DEFAULT_BUILDING_STATUSES.length * 2,
      );
    });

    it('does not throw when there are no organizations', async () => {
      const { service, repository } = build();
      (repository.listOrganizationIds as jest.Mock).mockResolvedValue([]);
      await expect(service.backfillAll()).resolves.toBeUndefined();
    });
  });
});
