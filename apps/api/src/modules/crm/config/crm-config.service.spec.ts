import { ConflictException } from '@nestjs/common';

import { type PrismaService } from '../../../prisma/prisma.service';
import { type AuditService } from '../../audit/audit.service';

import { type CrmConfigRepository } from './crm-config.repository';
import { CrmConfigService } from './crm-config.service';
import { DEFAULT_PERSON_TAGS, DEFAULT_PERSON_TYPES } from './default-crm-config';

function build(countsOverride: Partial<Record<'types' | 'tags', number>> = {}) {
  const counts = { types: 0, tags: 0, ...countsOverride };
  const repository = {
    findPersonTypeByName: jest.fn().mockResolvedValue(null),
    createPersonType: jest.fn().mockResolvedValue({ id: 'pt' }),
    findPersonTagByName: jest.fn().mockResolvedValue(null),
    createPersonTag: jest.fn().mockResolvedValue({ id: 'tag' }),
    countPersonTypes: jest.fn().mockResolvedValue(counts.types),
    countPersonTags: jest.fn().mockResolvedValue(counts.tags),
    listOrganizationIds: jest.fn().mockResolvedValue([{ id: 'org1' }, { id: 'org2' }]),
  } as unknown as CrmConfigRepository;
  const audit = { record: jest.fn() } as unknown as AuditService;
  const prisma = {} as PrismaService;
  return { service: new CrmConfigService(repository, prisma, audit), repository };
}

describe('CrmConfigService', () => {
  it('rejects a duplicate person type name', async () => {
    const { service, repository } = build();
    (repository.findPersonTypeByName as jest.Mock).mockResolvedValue({ id: 'existing' });
    await expect(service.createPersonType('org1', { name: 'Tenant' }, 'u1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  describe('seedDefaults', () => {
    it('seeds every default category for a brand-new (empty) organization', async () => {
      const { service, repository } = build();
      await service.seedDefaults({} as never, 'org1', 'u1');
      expect((repository.createPersonType as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_PERSON_TYPES.length,
      );
      expect((repository.createPersonTag as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_PERSON_TAGS.length,
      );
    });

    it('is idempotent: skips categories that already have rows', async () => {
      const { service, repository } = build({ types: DEFAULT_PERSON_TYPES.length, tags: 0 });
      await service.seedDefaults({} as never, 'org1', 'u1');
      expect(repository.createPersonType).not.toHaveBeenCalled();
      expect((repository.createPersonTag as jest.Mock).mock.calls).toHaveLength(
        DEFAULT_PERSON_TAGS.length,
      );
    });
  });

  describe('backfillAll', () => {
    it('runs seedDefaults for every existing organization, safe to run repeatedly', async () => {
      const { service, repository } = build();
      await service.backfillAll();
      expect(repository.listOrganizationIds).toHaveBeenCalled();
      expect((repository.createPersonType as jest.Mock).mock.calls.length).toBe(
        DEFAULT_PERSON_TYPES.length * 2,
      );
    });

    it('does not throw when there are no organizations', async () => {
      const { service, repository } = build();
      (repository.listOrganizationIds as jest.Mock).mockResolvedValue([]);
      await expect(service.backfillAll()).resolves.toBeUndefined();
    });
  });
});
