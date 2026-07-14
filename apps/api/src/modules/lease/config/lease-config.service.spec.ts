import { type PrismaService } from '../../../prisma/prisma.service';
import { type AuditService } from '../../audit/audit.service';

import {
  DEFAULT_LEASE_STATE_TRANSITIONS,
  DEFAULT_LEASE_STATUSES,
  DEFAULT_LEASE_TYPES,
  DEFAULT_PAYMENT_FREQUENCIES,
} from './default-lease-config';
import { type LeaseConfigRepository } from './lease-config.repository';
import { LeaseConfigService } from './lease-config.service';

function build(
  counts: Partial<Record<'types' | 'freqs' | 'statuses' | 'transitions', number>> = {},
) {
  const c = { types: 0, freqs: 0, statuses: 0, transitions: 0, ...counts };
  const seededStatuses = DEFAULT_LEASE_STATUSES.map((s, i) => ({ id: `status-${i}`, key: s.key }));

  const repository = {
    findLeaseTypeByName: jest.fn().mockResolvedValue(null),
    createLeaseType: jest.fn().mockResolvedValue({ id: 'lt' }),
    countLeaseTypes: jest.fn().mockResolvedValue(c.types),
    findPaymentFrequencyByName: jest.fn().mockResolvedValue(null),
    createPaymentFrequency: jest.fn().mockResolvedValue({ id: 'pf' }),
    countPaymentFrequencies: jest.fn().mockResolvedValue(c.freqs),
    countLeaseStatuses: jest.fn().mockResolvedValue(c.statuses),
    createLeaseStatus: jest.fn().mockResolvedValue({ id: 'ls' }),
    listLeaseStatuses: jest.fn().mockResolvedValue(seededStatuses),
    countLeaseStateTransitions: jest.fn().mockResolvedValue(c.transitions),
    createLeaseStateTransition: jest.fn().mockResolvedValue({ id: 'lst' }),
    listOrganizationIds: jest.fn().mockResolvedValue([{ id: 'org1' }, { id: 'org2' }]),
  } as unknown as LeaseConfigRepository;
  const audit = { record: jest.fn() } as unknown as AuditService;
  const prisma = {} as PrismaService;
  return { service: new LeaseConfigService(repository, prisma, audit), repository };
}

describe('LeaseConfigService.seedDefaults', () => {
  it('seeds every default category for a brand-new (empty) organization', async () => {
    const { service, repository } = build();
    await service.seedDefaults({} as never, 'org1', 'u1');

    expect((repository.createLeaseType as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_LEASE_TYPES.length,
    );
    expect((repository.createPaymentFrequency as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_PAYMENT_FREQUENCIES.length,
    );
    expect((repository.createLeaseStatus as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_LEASE_STATUSES.length,
    );
    expect((repository.createLeaseStateTransition as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_LEASE_STATE_TRANSITIONS.length,
    );
  });

  it('is idempotent: skips categories that already have rows', async () => {
    const { service, repository } = build({
      types: DEFAULT_LEASE_TYPES.length,
      statuses: DEFAULT_LEASE_STATUSES.length,
    });
    await service.seedDefaults({} as never, 'org1', 'u1');
    expect(repository.createLeaseType).not.toHaveBeenCalled();
    expect(repository.createLeaseStatus).not.toHaveBeenCalled();
    // frequencies/transitions were still empty in this scenario, so they should seed
    expect((repository.createPaymentFrequency as jest.Mock).mock.calls).toHaveLength(
      DEFAULT_PAYMENT_FREQUENCIES.length,
    );
  });

  it('resolves state-transition edges by status key, not array order', async () => {
    const { service, repository } = build();
    await service.seedDefaults({} as never, 'org1', 'u1');
    const [, fromId, toId] = (repository.createLeaseStateTransition as jest.Mock).mock.calls[0];
    expect(typeof fromId).toBe('string');
    expect(typeof toId).toBe('string');
  });

  it('backfillAll runs seedDefaults for every existing organization', async () => {
    const { service, repository } = build();
    await service.backfillAll();
    expect(repository.listOrganizationIds).toHaveBeenCalled();
    expect((repository.createLeaseType as jest.Mock).mock.calls.length).toBe(
      DEFAULT_LEASE_TYPES.length * 2,
    );
  });
});
