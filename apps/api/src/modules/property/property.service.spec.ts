import { ConflictException } from '@nestjs/common';
import { type Property } from '@prisma/client';

import { type PrismaService } from '../../prisma/prisma.service';
import { type AuditService } from '../audit/audit.service';
import { type NumberGeneratorService } from '../config/numbering/number-generator.service';
import { type GeoRepository } from '../geo/geo.repository';

import { type PropertyConfigRepository } from './config/property-config.repository';
import { type PropertyRepository } from './property.repository';
import { PropertyService } from './property.service';

interface Mocks {
  prisma: { $transaction: jest.Mock };
  repository: {
    buildWhere: jest.Mock;
    findByCode: jest.Mock;
    findBySlug: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    setDeletedAt: jest.Mock;
    search: jest.Mock;
    replaceFeatures: jest.Mock;
    replaceTags: jest.Mock;
  };
  config: {
    findType: jest.Mock;
    findStatus: jest.Mock;
    findFeature: jest.Mock;
    findTag: jest.Mock;
  };
  geo: {
    findCountry: jest.Mock;
    findState: jest.Mock;
    findCity: jest.Mock;
    findDistrict: jest.Mock;
    findArea: jest.Mock;
  };
  numbers: { next: jest.Mock };
  audit: { record: jest.Mock };
}

function build(): { service: PropertyService; m: Mocks } {
  const m: Mocks = {
    prisma: { $transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn({})) },
    repository: {
      buildWhere: jest.fn().mockReturnValue({}),
      findByCode: jest.fn(),
      findBySlug: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'p1' }),
      setDeletedAt: jest.fn(),
      search: jest.fn(),
      replaceFeatures: jest.fn(),
      replaceTags: jest.fn(),
    },
    config: {
      findType: jest.fn().mockResolvedValue({ id: 't' }),
      findStatus: jest.fn().mockResolvedValue({ id: 's' }),
      findFeature: jest.fn().mockResolvedValue({ id: 'f' }),
      findTag: jest.fn().mockResolvedValue({ id: 'g' }),
    },
    geo: {
      findCountry: jest.fn(),
      findState: jest.fn(),
      findCity: jest.fn(),
      findDistrict: jest.fn(),
      findArea: jest.fn(),
    },
    numbers: { next: jest.fn().mockResolvedValue({ value: 1, formatted: 'PROP-000001' }) },
    audit: { record: jest.fn() },
  };
  const service = new PropertyService(
    m.prisma as unknown as PrismaService,
    m.repository as unknown as PropertyRepository,
    m.config as unknown as PropertyConfigRepository,
    m.geo as unknown as GeoRepository,
    m.numbers as unknown as NumberGeneratorService,
    m.audit as unknown as AuditService,
  );
  return { service, m };
}

const baseDto = { name: 'Prime Estate', propertyTypeId: 't', statusId: 's' };

describe('PropertyService', () => {
  it('generates a property code from the numbering engine when none supplied', async () => {
    const { service, m } = build();
    m.repository.findByCode.mockResolvedValue(null);
    m.repository.findById.mockResolvedValue({ id: 'p1', propertyCode: 'PROP-000001' } as Property);
    await service.create('org1', baseDto, 'u1');
    expect(m.numbers.next).toHaveBeenCalledWith('org1', 'PROPERTY', 'u1');
  });

  it('rejects a duplicate property code', async () => {
    const { service, m } = build();
    m.repository.findByCode.mockResolvedValue({ id: 'existing' } as Property);
    await expect(
      service.create('org1', { ...baseDto, propertyCode: 'PROP-000001' }, 'u1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('archive refuses an already-archived property', async () => {
    const { service, m } = build();
    m.repository.findById.mockResolvedValue({ id: 'p1', deletedAt: new Date() } as Property);
    await expect(service.archive('org1', 'p1', 'u1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('restore refuses a property that is not archived', async () => {
    const { service, m } = build();
    m.repository.findById.mockResolvedValue({ id: 'p1', deletedAt: null } as Property);
    await expect(service.restore('org1', 'p1', 'u1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('search returns a paginated envelope with pageCount', async () => {
    const { service, m } = build();
    m.repository.search.mockResolvedValue([[{ id: 'p1' }], 25]);
    const result = await service.search('org1', {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 2,
      pageSize: 10,
    } as never);
    expect(result.total).toBe(25);
    expect(result.page).toBe(2);
    expect(result.pageCount).toBe(3);
  });
});
