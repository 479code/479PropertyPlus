import { Injectable } from '@nestjs/common';
import { type LeaseTimelineEntry, type LeaseTimelineEvent, type Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

@Injectable()
export class LeaseTimelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  record(
    db: PrismaDb,
    leaseId: string,
    eventType: LeaseTimelineEvent,
    performedBy?: string,
    description?: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<LeaseTimelineEntry> {
    return db.leaseTimelineEntry.create({
      data: {
        leaseId,
        eventType,
        performedBy: performedBy ?? null,
        description: description ?? null,
        metadata: metadata ?? undefined,
      },
    });
  }

  list(leaseId: string): Promise<LeaseTimelineEntry[]> {
    return this.prisma.leaseTimelineEntry.findMany({
      where: { leaseId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
