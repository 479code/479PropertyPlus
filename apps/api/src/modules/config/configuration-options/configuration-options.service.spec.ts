import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuditService } from '../../audit/audit.service';

import { ConfigurationOptionsRepository } from './configuration-options.repository';
import { ConfigurationOptionsService } from './configuration-options.service';

describe('ConfigurationOptionsService', () => {
  let service: ConfigurationOptionsService;
  let repository: jest.Mocked<ConfigurationOptionsRepository>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationOptionsService,
        {
          provide: ConfigurationOptionsRepository,
          useValue: {
            findByKey: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            findManyAndCount: jest.fn(),
          },
        },
        { provide: AuditService, useValue: { record: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(ConfigurationOptionsService);
    repository = moduleRef.get(ConfigurationOptionsRepository);
  });

  it('rejects duplicate keys within a category', async () => {
    repository.findByKey.mockResolvedValue({ id: 'x' } as never);
    await expect(
      service.create('org1', {
        category: 'PROPERTY_TYPE',
        key: 'apartment',
        label: 'Apartment',
      } as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when an option is not found', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getOrThrow('org1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents deleting system options', async () => {
    repository.findById.mockResolvedValue({ id: 'o1', isSystem: true } as never);
    await expect(service.remove('org1', 'o1')).rejects.toBeInstanceOf(ConflictException);
  });
});
