import { type NumberedEntity } from '@prisma/client';

import { type PrismaService } from '../../../prisma/prisma.service';

import { NumberGeneratorService } from './number-generator.service';

/**
 * Milestone 004 reuses the M002.5 NumberGeneratorService for BUILDING, FLOOR,
 * and UNIT codes rather than introducing a parallel numbering mechanism. These
 * tests confirm each entity auto-provisions with its expected default prefix
 * and formats a first-issue code correctly, on first use (no existing sequence row).
 */
function buildPrisma(): PrismaService {
  const sequences = new Map<string, any>();
  const tx = {
    numberingSequence: {
      findUnique: jest.fn(({ where }: any) => {
        const key = `${where.organizationId_entity.organizationId}:${where.organizationId_entity.entity}`;
        return Promise.resolve(sequences.get(key) ?? null);
      }),
      create: jest.fn(({ data }: any) => {
        const key = `${data.organizationId}:${data.entity}`;
        const row = {
          id: key,
          organizationId: data.organizationId,
          entity: data.entity,
          prefix: data.prefix,
          suffix: '',
          padding: 6,
          separator: '-',
          includeYear: false,
          resetPolicy: 'NEVER',
          currentValue: 0,
          lastResetPeriod: null,
        };
        sequences.set(key, row);
        return Promise.resolve(row);
      }),
      update: jest.fn(({ where, data }: any) => {
        const row =
          sequences.get(where.id) ?? [...sequences.values()].find((s) => s.id === where.id);
        Object.assign(row, data);
        return Promise.resolve(row);
      }),
    },
  };
  return {
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  } as unknown as PrismaService;
}

describe('NumberGeneratorService — inventory entity reuse', () => {
  it.each<[NumberedEntity, string]>([
    ['BUILDING', 'BLD-000001'],
    ['FLOOR', 'FLR-000001'],
    ['UNIT', 'UNIT-000001'],
  ])('auto-provisions %s with its default prefix on first issuance', async (entity, expected) => {
    const service = new NumberGeneratorService(buildPrisma());
    const result = await service.next('org1', entity, 'u1');
    expect(result.formatted).toBe(expected);
    expect(result.value).toBe(1);
  });

  it('increments sequentially on repeated calls for the same entity', async () => {
    const prisma = buildPrisma();
    const service = new NumberGeneratorService(prisma);
    const first = await service.next('org1', 'UNIT', 'u1');
    const second = await service.next('org1', 'UNIT', 'u1');
    expect(first.formatted).toBe('UNIT-000001');
    expect(second.formatted).toBe('UNIT-000002');
  });

  it('keeps independent sequences per entity within the same organization', async () => {
    const prisma = buildPrisma();
    const service = new NumberGeneratorService(prisma);
    const building = await service.next('org1', 'BUILDING', 'u1');
    const unit = await service.next('org1', 'UNIT', 'u1');
    expect(building.formatted).toBe('BLD-000001');
    expect(unit.formatted).toBe('UNIT-000001');
  });
});
