import { createHash, randomBytes } from 'node:crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type OrganizationInvite } from '@prisma/client';

import { AuditService } from '../audit/audit.service';
import { RbacService } from '../rbac/rbac.service';

import { type CreateInviteDto } from './dto/create-invite.dto';
import { OrganizationInviteRepository } from './organization-invite.repository';

export interface IssuedInvite {
  invite: OrganizationInvite;
  /** Raw token to embed in the invite link — shown once, never stored. */
  token: string;
}

@Injectable()
export class OrganizationInviteService {
  private readonly ttlMs: number;

  constructor(
    private readonly repository: OrganizationInviteRepository,
    private readonly rbac: RbacService,
    private readonly audit: AuditService,
    config: ConfigService,
  ) {
    const days = Number(config.get('INVITE_TTL_DAYS', 7));
    this.ttlMs = days * 24 * 60 * 60 * 1000;
  }

  async invite(
    organizationId: string,
    dto: CreateInviteDto,
    actorId?: string,
  ): Promise<IssuedInvite> {
    const role = await this.rbac.findRoleByKey(organizationId, dto.roleKey);
    if (!role) {
      throw new BadRequestException(`Unknown role "${dto.roleKey}" for this organization`);
    }
    const pending = await this.repository.findPendingByEmail(organizationId, dto.email);
    if (pending) {
      throw new ConflictException(`A pending invitation already exists for ${dto.email}`);
    }

    const token = this.generateToken();
    const invite = await this.repository.create({
      organizationId,
      email: dto.email,
      roleId: role.id,
      tokenHash: this.hash(token),
      expiresAt: new Date(Date.now() + this.ttlMs),
      createdBy: actorId,
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'OrganizationInvite',
      entityId: invite.id,
      description: `Invited ${dto.email} as ${dto.roleKey}`,
    });
    return { invite, token };
  }

  list(organizationId: string): Promise<OrganizationInvite[]> {
    return this.repository.findByOrg(organizationId);
  }

  private async getOwnedOrThrow(organizationId: string, id: string): Promise<OrganizationInvite> {
    const invite = await this.repository.findById(id);
    if (!invite || invite.organizationId !== organizationId) {
      throw new NotFoundException(`Invitation ${id} not found`);
    }
    return invite;
  }

  async resend(organizationId: string, id: string, actorId?: string): Promise<IssuedInvite> {
    const existing = await this.getOwnedOrThrow(organizationId, id);
    if (existing.status === 'ACCEPTED') {
      throw new ConflictException('Invitation has already been accepted');
    }
    const token = this.generateToken();
    const invite = await this.repository.updateToken(
      id,
      this.hash(token),
      new Date(Date.now() + this.ttlMs),
    );
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'OrganizationInvite',
      entityId: id,
      description: 'Invitation resent',
    });
    return { invite, token };
  }

  async cancel(organizationId: string, id: string, actorId?: string): Promise<void> {
    const existing = await this.getOwnedOrThrow(organizationId, id);
    if (existing.status === 'ACCEPTED') {
      throw new ConflictException('Cannot cancel an accepted invitation');
    }
    await this.repository.setStatus(id, 'CANCELLED');
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'OrganizationInvite',
      entityId: id,
      description: 'Invitation cancelled',
    });
  }

  /**
   * Validate a raw invite token for acceptance. Throws if unknown, already
   * used/cancelled, or expired (expiry also flips the record to EXPIRED).
   * Does not mutate on success — the caller marks it accepted once the
   * membership is created, so acceptance stays atomic with member provisioning.
   */
  async validateForAcceptance(rawToken: string): Promise<OrganizationInvite> {
    const invite = await this.repository.findByHash(this.hash(rawToken));
    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }
    if (invite.status !== 'PENDING') {
      throw new BadRequestException(`Invitation is ${invite.status.toLowerCase()}`);
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      await this.repository.setStatus(invite.id, 'EXPIRED');
      throw new BadRequestException('Invitation has expired');
    }
    return invite;
  }

  markAccepted(id: string): Promise<OrganizationInvite> {
    return this.repository.setStatus(id, 'ACCEPTED', new Date());
  }

  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hash(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
