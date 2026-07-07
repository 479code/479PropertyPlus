import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { type Membership } from '@prisma/client';

import { type MembershipRepository } from './membership.repository';
import { MembershipService } from './membership.service';

function build(found: Partial<Membership> | null): { service: MembershipService } {
  const repository = {
    findByUserAndOrg: jest.fn().mockResolvedValue(found),
  } as unknown as MembershipRepository;
  return { service: new MembershipService(repository) };
}

describe('MembershipService.getActiveOrThrow', () => {
  it('throws NotFound when the user has no membership in the org', async () => {
    const { service } = build(null);
    await expect(service.getActiveOrThrow('u1', 'o1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forbids a suspended membership', async () => {
    const { service } = build({ id: 'm1', status: 'SUSPENDED' });
    await expect(service.getActiveOrThrow('u1', 'o1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns an active membership', async () => {
    const { service } = build({ id: 'm1', status: 'ACTIVE' });
    await expect(service.getActiveOrThrow('u1', 'o1')).resolves.toMatchObject({ id: 'm1' });
  });
});
