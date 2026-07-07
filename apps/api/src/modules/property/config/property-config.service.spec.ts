import { ConflictException } from '@nestjs/common';

import { type AuditService } from '../../audit/audit.service';

import {
  DEFAULT_PROPERTY_FEATURES,
  DEFAULT_PROPERTY_STATUSES,
  DEFAULT_PROPERTY_TAGS,
  DEFAULT_PROPERTY_TYPES,
} from './default-property-config';
import { type PropertyConfigRepository } from './property-config.repository';
import { PropertyConfigService } from './property-config.service';

function build() {
  const repository = {
    findTypeByName: jest.fn().mockResolvedValue(null),
    createType: jest.fn().mockResolvedValue({ id: 't' }),
    createStatus: jest.fn().mockResolvedValue({ id: 's' }),
    createFeature: jest.fn().mockResolvedValue({ id: 'f' }),
    createTag: jest.fn().mockResolvedValue({ id: 'g' }),
  } as unknown as PropertyConfigRepository;
  const audit = { record: jest.fn() } as unknown as AuditService;
  return { service: new PropertyConfigService(repository, audit), repository };
}

describe('PropertyConfigService', () => {
  it('rejects a duplicate type name', async () => {
    const { service, repository } = build();
    (repository.findTypeByName as jest.Mock).mockResolvedValue({ id: 'existing' });
    await expect(service.createType('org1', { name: 'Residential' }, 'u1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('seeds the full default configuration set for a new organization', async () => {
    const { service, repository } = build();
    await service.seedDefaults({} as never, 'org1', 'u1');
    expect((repository.createType as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_PROPERTY_TYPES.length,
    );
    expect((repository.createStatus as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_PROPERTY_STATUSES.length,
    );
    expect((repository.createFeature as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_PROPERTY_FEATURES.length,
    );
    expect((repository.createTag as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_PROPERTY_TAGS.length,
    );
  });
});
