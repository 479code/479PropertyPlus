import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { type Membership } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InventoryConfigService } from '../inventory/config/inventory-config.service';
import { OrganizationInviteService } from '../invites/organization-invite.service';
import { MembershipRepository } from '../membership/membership.repository';
import { MembershipService } from '../membership/membership.service';
import { OrganizationRepository } from '../organization/organization.repository';
import { PropertyConfigService } from '../property/config/property-config.service';
import { RbacService } from '../rbac/rbac.service';
import { UsersRepository } from '../users/users.repository';
import { type PublicUser, toPublicUser, UsersService } from '../users/users.service';

import { type AuthenticatedUser, type TokenPair } from './auth.types';
import { type AcceptInviteDto } from './dto/accept-invite.dto';
import { type LoginDto } from './dto/login.dto';
import { type RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthSession {
  user: PublicUser;
  organizationId: string;
  membershipId: string;
  tokens: TokenPair;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly organizations: OrganizationRepository,
    private readonly memberships: MembershipService,
    private readonly membershipRepository: MembershipRepository,
    private readonly rbac: RbacService,
    private readonly invites: OrganizationInviteService,
    private readonly propertyConfig: PropertyConfigService,
    private readonly inventoryConfig: InventoryConfigService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Self-service signup. Creates the user, a new organization, its default
   * roles + settings, an Owner membership — atomically — then returns an
   * authenticated session. The permission catalog is ensured first (idempotent,
   * global) so role provisioning can link to it.
   */
  async register(dto: RegisterDto, meta?: RequestMeta): Promise<AuthSession> {
    const email = dto.email.toLowerCase();
    if (await this.usersRepository.findByEmail(email)) {
      throw new ConflictException('An account with that email already exists');
    }

    await this.rbac.seedPermissionCatalog();
    const passwordHash = await this.passwords.hash(dto.password);
    const slug = await this.uniqueSlug(dto.organizationName);

    const { user, organization, membership } = await this.prisma.$transaction(async (tx) => {
      const createdUser = await this.usersRepository.create(tx, {
        email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      const createdOrg = await this.organizations.create(
        { name: dto.organizationName, slug, createdBy: createdUser.id },
        tx,
      );
      // Seed the organization's default settings row (all columns have defaults).
      await tx.organizationSettings.create({
        data: {
          organizationId: createdOrg.id,
          createdBy: createdUser.id,
          updatedBy: createdUser.id,
        },
      });
      const ownerRole = await this.rbac.provisionOrganizationRoles(
        tx,
        createdOrg.id,
        createdUser.id,
      );
      const createdMembership = await this.membershipRepository.create(tx, {
        userId: createdUser.id,
        organizationId: createdOrg.id,
        status: 'ACTIVE',
        createdBy: createdUser.id,
      });
      await this.rbac.assignRole(tx, createdMembership.id, ownerRole.id);
      await this.propertyConfig.seedDefaults(tx, createdOrg.id, createdUser.id);
      await this.inventoryConfig.seedDefaults(tx, createdOrg.id, createdUser.id);
      return { user: createdUser, organization: createdOrg, membership: createdMembership };
    });

    await this.audit.record({
      organizationId: organization.id,
      userId: user.id,
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      description: `User registered and founded "${organization.name}"`,
    });

    const tokens = await this.tokens.issuePair(
      {
        userId: user.id,
        organizationId: organization.id,
        membershipId: membership.id,
        email: user.email,
      },
      meta,
    );
    return {
      user: toPublicUser(user),
      organizationId: organization.id,
      membershipId: membership.id,
      tokens,
    };
  }

  /** Password login. Establishes the session in the user's first active organization. */
  async login(dto: LoginDto, meta?: RequestMeta): Promise<AuthSession> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await this.passwords.verify(user.passwordHash, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = await this.firstActiveMembership(user.id);
    await this.usersRepository.setLastLogin(user.id);
    await this.audit.record({
      organizationId: membership.organizationId,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    const tokens = await this.tokens.issuePair(
      {
        userId: user.id,
        organizationId: membership.organizationId,
        membershipId: membership.id,
        email: user.email,
      },
      meta,
    );
    return {
      user: toPublicUser(user),
      organizationId: membership.organizationId,
      membershipId: membership.id,
      tokens,
    };
  }

  /** Rotate a refresh token, preserving the organization context it was issued for. */
  async refresh(rawToken: string, meta?: RequestMeta): Promise<AuthSession> {
    const record = await this.tokens.validateRefreshToken(rawToken);
    const user = await this.usersRepository.findById(record.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }
    const membership = await this.memberships.getActiveOrThrow(user.id, record.organizationId);
    const tokens = await this.tokens.rotate(
      rawToken,
      {
        userId: user.id,
        organizationId: membership.organizationId,
        membershipId: membership.id,
        email: user.email,
      },
      meta,
    );
    return {
      user: toPublicUser(user),
      organizationId: membership.organizationId,
      membershipId: membership.id,
      tokens,
    };
  }

  /** Switch the active organization, validating membership and minting a fresh token pair. */
  async switchOrganization(
    principal: AuthenticatedUser,
    organizationId: string,
    meta?: RequestMeta,
  ): Promise<AuthSession> {
    const membership = await this.memberships.getActiveOrThrow(principal.userId, organizationId);
    const user = await this.users.getProfile(principal.userId);
    const tokens = await this.tokens.issuePair(
      {
        userId: principal.userId,
        organizationId,
        membershipId: membership.id,
        email: principal.email,
      },
      meta,
    );
    await this.audit.record({
      organizationId,
      userId: principal.userId,
      action: 'LOGIN',
      entityType: 'Membership',
      entityId: membership.id,
      description: 'Switched active organization',
    });
    return { user, organizationId, membershipId: membership.id, tokens };
  }

  async logout(principal: AuthenticatedUser, rawToken: string): Promise<void> {
    await this.tokens.revoke(rawToken);
    await this.audit.record({
      organizationId: principal.organizationId,
      userId: principal.userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: principal.userId,
    });
  }

  /**
   * Accept an organization invitation. If the invited email has no account, one
   * is created (password required); otherwise the existing user simply joins.
   * The membership + role assignment + acceptance are committed atomically, and
   * the caller receives a session scoped to the joined organization.
   */
  async acceptInvite(dto: AcceptInviteDto, meta?: RequestMeta): Promise<AuthSession> {
    const invite = await this.invites.validateForAcceptance(dto.token);
    const existingUser = await this.usersRepository.findByEmail(invite.email);

    let passwordHash: string | null = null;
    if (!existingUser) {
      if (!dto.password) {
        throw new ForbiddenException('A password is required to create your account');
      }
      passwordHash = await this.passwords.hash(dto.password);
    }

    const { userId, membership } = await this.prisma.$transaction(async (tx) => {
      const user =
        existingUser ??
        (await this.usersRepository.create(tx, {
          email: invite.email,
          passwordHash: passwordHash as string,
          firstName: dto.firstName,
          lastName: dto.lastName,
        }));

      const existingMembership = await this.membershipRepository.findByUserAndOrg(
        user.id,
        invite.organizationId,
      );
      if (existingMembership) {
        throw new ConflictException('You are already a member of this organization');
      }

      const created = await this.membershipRepository.create(tx, {
        userId: user.id,
        organizationId: invite.organizationId,
        status: 'ACTIVE',
        createdBy: user.id,
      });
      await this.rbac.assignRole(tx, created.id, invite.roleId);
      await this.invites.markAccepted(invite.id);
      return { userId: user.id, membership: created };
    });

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found after acceptance');
    }
    await this.audit.record({
      organizationId: invite.organizationId,
      userId,
      action: 'CREATE',
      entityType: 'Membership',
      entityId: membership.id,
      description: `Accepted invitation to join organization`,
    });

    const tokens = await this.tokens.issuePair(
      {
        userId,
        organizationId: invite.organizationId,
        membershipId: membership.id,
        email: user.email,
      },
      meta,
    );
    return {
      user: toPublicUser(user),
      organizationId: invite.organizationId,
      membershipId: membership.id,
      tokens,
    };
  }

  private async firstActiveMembership(userId: string): Promise<Membership> {
    const memberships = await this.memberships.listForUser(userId);
    const active = memberships.find((m) => m.status === 'ACTIVE');
    if (!active) {
      throw new ForbiddenException('No active organization membership for this account');
    }
    return active;
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'org';
    let slug = base;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await this.organizations.findBySlug(slug);
      if (!existing) {
        return slug;
      }
      slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }
}
