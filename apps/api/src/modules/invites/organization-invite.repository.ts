import { Injectable } from '@nestjs/common';
import { type InviteStatus, type OrganizationInvite } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

export interface CreateInviteInput {
  organizationId: string;
  email: string;
  roleId: string;
  tokenHash: string;
  expiresAt: Date;
  createdBy?: string;
}

@Injectable()
export class OrganizationInviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateInviteInput): Promise<OrganizationInvite> {
    return this.prisma.organizationInvite.create({
      data: {
        organizationId: input.organizationId,
        email: input.email.toLowerCase(),
        roleId: input.roleId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        createdBy: input.createdBy ?? null,
      },
    });
  }

  findById(id: string): Promise<OrganizationInvite | null> {
    return this.prisma.organizationInvite.findUnique({ where: { id } });
  }

  findByHash(tokenHash: string): Promise<OrganizationInvite | null> {
    return this.prisma.organizationInvite.findUnique({ where: { tokenHash } });
  }

  findByOrg(organizationId: string): Promise<OrganizationInvite[]> {
    return this.prisma.organizationInvite.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPendingByEmail(organizationId: string, email: string): Promise<OrganizationInvite | null> {
    return this.prisma.organizationInvite.findFirst({
      where: { organizationId, email: email.toLowerCase(), status: 'PENDING' },
    });
  }

  updateToken(id: string, tokenHash: string, expiresAt: Date): Promise<OrganizationInvite> {
    return this.prisma.organizationInvite.update({
      where: { id },
      data: { tokenHash, expiresAt, status: 'PENDING' },
    });
  }

  setStatus(id: string, status: InviteStatus, acceptedAt?: Date): Promise<OrganizationInvite> {
    return this.prisma.organizationInvite.update({
      where: { id },
      data: { status, acceptedAt: acceptedAt ?? null },
    });
  }
}
