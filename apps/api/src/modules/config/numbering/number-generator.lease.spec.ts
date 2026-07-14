import { type PrismaService } from '../../../prisma/prisma.service';

import { NumberGeneratorService } from './number-generator.service';

/** Milestone 006 reuses the M002.5 NumberGeneratorService for LEASE codes. */
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

describe('NumberGeneratorService — Lease entity reuse', () => {
  it('auto-provisions LEASE with its default prefix on first issuance', async () => {
    const service = new NumberGeneratorService(buildPrisma());
    const result = await service.next('org1', 'LEASE', 'u1');
    expect(result.formatted).toBe('LSE-000001');
    expect(result.value).toBe(1);
  });

  it('increments sequentially on repeated calls for LEASE', async () => {
    const prisma = buildPrisma();
    const service = new NumberGeneratorService(prisma);
    const first = await service.next('org1', 'LEASE', 'u1');
    const second = await service.next('org1', 'LEASE', 'u1');
    expect(first.formatted).toBe('LSE-000001');
    expect(second.formatted).toBe('LSE-000002');
  });
});
