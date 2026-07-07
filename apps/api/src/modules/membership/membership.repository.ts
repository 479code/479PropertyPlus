import { Injectable } from '@nestjs/common';
import { type Membership, type MembershipStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { type PrismaDb } from '../rbac/rbac.repository';

export interface CreateMembershipInput {
  userId: string;
  organizationId: string;
  status?: MembershipStatus;
  createdBy?: string;
}

@Injectable()
export class MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(db: PrismaDb, input: CreateMembershipInput): Promise<Membership> {
    return db.membership.create({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        status: input.status ?? 'ACTIVE',
        createdBy: input.createdBy ?? null,
      },
    });
  }

  findById(id: string): Promise<Membership | null> {
    return this.prisma.membership.findFirst({ where: { id, deletedAt: null } });
  }

  findByUserAndOrg(userId: string, organizationId: string): Promise<Membership | null> {
    return this.prisma.membership.findFirst({
      where: { userId, organizationId, deletedAt: null },
    });
  }

  findActiveForUser(userId: string): Promise<Membership[]> {
    return this.prisma.membership.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  updateStatus(id: string, status: MembershipStatus, updatedBy?: string): Promise<Membership> {
    return this.prisma.membership.update({
      where: { id },
      data: { status, updatedBy: updatedBy ?? null },
    });
  }
}
