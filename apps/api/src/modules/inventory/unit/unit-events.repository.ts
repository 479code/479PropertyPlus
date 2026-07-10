import { Injectable } from '@nestjs/common';
import {
  type Prisma,
  type UnitAvailability,
  type UnitTimeline,
  type UnitTimelineEvent,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

@Injectable()
export class UnitEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  recordTimeline(
    db: PrismaDb,
    unitId: string,
    eventType: UnitTimelineEvent,
    performedBy?: string,
    description?: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<UnitTimeline> {
    return db.unitTimeline.create({
      data: {
        unitId,
        eventType,
        performedBy: performedBy ?? null,
        description: description ?? null,
        metadata: metadata ?? undefined,
      },
    });
  }

  recordOccupancy(
    db: PrismaDb,
    unitId: string,
    previousAvailability: UnitAvailability | null,
    newAvailability: UnitAvailability,
    changedBy?: string,
    reason?: string,
  ): Promise<unknown> {
    return db.unitOccupancyHistory.create({
      data: {
        unitId,
        previousAvailability,
        newAvailability,
        changedBy: changedBy ?? null,
        reason: reason ?? null,
      },
    });
  }

  listTimeline(unitId: string): Promise<UnitTimeline[]> {
    return this.prisma.unitTimeline.findMany({ where: { unitId }, orderBy: { createdAt: 'desc' } });
  }
  listOccupancy(unitId: string): Promise<unknown[]> {
    return this.prisma.unitOccupancyHistory.findMany({
      where: { unitId },
      orderBy: { changedAt: 'desc' },
    });
  }
}
