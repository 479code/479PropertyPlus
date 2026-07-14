import { BadRequestException } from '@nestjs/common';

import { type LeaseConfigRepository } from '../config/lease-config.repository';

import { LeaseStateMachineService } from './lease-state-machine.service';

function build(allowed: boolean) {
  const configRepository = {
    findAllowedTransition: jest.fn().mockResolvedValue(allowed ? { id: 't1' } : null),
    findLeaseStatusById: jest
      .fn()
      .mockImplementation((_org: string, id: string) => Promise.resolve({ id, name: id })),
    listTransitionsFrom: jest
      .fn()
      .mockResolvedValue([{ toStatus: { id: 'active', key: 'ACTIVE' } }]),
  } as unknown as LeaseConfigRepository;
  return { service: new LeaseStateMachineService(configRepository), configRepository };
}

describe('LeaseStateMachineService', () => {
  it('allows a transition that exists as a row in LeaseStateTransition', async () => {
    const { service } = build(true);
    await expect(service.assertCanTransition('org1', 'draft', 'pending')).resolves.toBeUndefined();
  });

  it('rejects a transition with no matching row', async () => {
    const { service } = build(false);
    await expect(service.assertCanTransition('org1', 'draft', 'active')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('treats a no-op (same from/to status) as always allowed without querying the DB', async () => {
    const { service, configRepository } = build(false);
    await expect(service.assertCanTransition('org1', 'active', 'active')).resolves.toBeUndefined();
    expect(configRepository.findAllowedTransition).not.toHaveBeenCalled();
  });

  it('returns the allowed next statuses for a given status', async () => {
    const { service } = build(true);
    const next = await service.getAllowedNextStatuses('org1', 'draft');
    expect(next).toEqual([{ id: 'active', key: 'ACTIVE' }]);
  });
});
