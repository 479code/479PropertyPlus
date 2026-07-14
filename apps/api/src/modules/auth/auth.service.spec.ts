import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { type User } from '@prisma/client';

import { type PrismaService } from '../../prisma/prisma.service';
import { type AuditService } from '../audit/audit.service';
import { type OrganizationInviteService } from '../invites/organization-invite.service';
import { type MembershipRepository } from '../membership/membership.repository';
import { type MembershipService } from '../membership/membership.service';
import { type OrganizationRepository } from '../organization/organization.repository';
import { type RbacService } from '../rbac/rbac.service';
import { type UsersRepository } from '../users/users.repository';
import { type UsersService } from '../users/users.service';

import { AuthService } from './auth.service';
import { type PasswordService } from './password.service';
import { type TokenService } from './token.service';

interface Mocks {
  usersRepository: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    setLastLogin: jest.Mock;
  };
  passwords: { hash: jest.Mock; verify: jest.Mock };
  memberships: { listForUser: jest.Mock; getActiveOrThrow: jest.Mock };
  tokens: { issuePair: jest.Mock };
  users: { getProfile: jest.Mock };
  rbac: { seedPermissionCatalog: jest.Mock };
  audit: { record: jest.Mock };
}

function build(): { service: AuthService; m: Mocks } {
  const m: Mocks = {
    usersRepository: {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setLastLogin: jest.fn(),
    },
    passwords: { hash: jest.fn().mockResolvedValue('hashed'), verify: jest.fn() },
    memberships: { listForUser: jest.fn(), getActiveOrThrow: jest.fn() },
    tokens: {
      issuePair: jest
        .fn()
        .mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 900 }),
    },
    users: { getProfile: jest.fn().mockResolvedValue({ id: 'u1', email: 'u@x.com' }) },
    rbac: { seedPermissionCatalog: jest.fn() },
    audit: { record: jest.fn() },
  };
  const service = new AuthService(
    {} as PrismaService,
    m.users as unknown as UsersService,
    m.usersRepository as unknown as UsersRepository,
    {} as OrganizationRepository,
    m.memberships as unknown as MembershipService,
    {} as MembershipRepository,
    m.rbac as unknown as RbacService,
    {} as OrganizationInviteService,
    {
      seedDefaults: jest.fn(),
    } as unknown as import('../property/config/property-config.service').PropertyConfigService,
    {
      seedDefaults: jest.fn(),
    } as unknown as import('../inventory/config/inventory-config.service').InventoryConfigService,
    {
      seedDefaults: jest.fn(),
    } as unknown as import('../crm/config/crm-config.service').CrmConfigService,
    {
      seedDefaults: jest.fn(),
    } as unknown as import('../lease/config/lease-config.service').LeaseConfigService,
    m.passwords as unknown as PasswordService,
    m.tokens as unknown as TokenService,
    m.audit as unknown as AuditService,
  );
  return { service, m };
}

describe('AuthService', () => {
  it('rejects registration when the email already exists', async () => {
    const { service, m } = build();
    m.usersRepository.findByEmail.mockResolvedValue({ id: 'u1' } as User);
    await expect(
      service.register({ email: 'u@x.com', password: 'password1', organizationName: 'Acme' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects login for an unknown user', async () => {
    const { service, m } = build();
    m.usersRepository.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'no@x.com', password: 'x' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects login on a bad password', async () => {
    const { service, m } = build();
    m.usersRepository.findByEmail.mockResolvedValue({
      id: 'u1',
      passwordHash: 'h',
      isActive: true,
    } as User);
    m.passwords.verify.mockResolvedValue(false);
    await expect(service.login({ email: 'u@x.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('switches organization and mints a fresh token pair', async () => {
    const { service, m } = build();
    m.memberships.getActiveOrThrow.mockResolvedValue({
      id: 'm2',
      organizationId: 'o2',
      status: 'ACTIVE',
    });
    const principal = { userId: 'u1', organizationId: 'o1', membershipId: 'm1', email: 'u@x.com' };
    const session = await service.switchOrganization(principal, 'o2');
    expect(session.organizationId).toBe('o2');
    expect(session.membershipId).toBe('m2');
    expect(session.tokens.accessToken).toBe('a');
    expect(m.tokens.issuePair).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'o2', membershipId: 'm2' }),
      undefined,
    );
  });
});
