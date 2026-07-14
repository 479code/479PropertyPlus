import { Injectable } from '@nestjs/common';

import { AvailabilityService } from '../../inventory/availability/availability.service';
import { CountsService } from '../../inventory/counts/counts.service';
import { UnitEventsRepository } from '../../inventory/unit/unit-events.repository';
import { type PrismaDb } from '../../rbac/rbac.repository';

@Injectable()
export class LeaseOccupancyService {
  constructor(
    private readonly availability: AvailabilityService,
    private readonly unitEvents: UnitEventsRepository,
    private readonly counts: CountsService,
  ) {}

  /**
   * Recomputes and persists a unit's availability given whether it currently
   * has a lease whose status counts as occupancy (see LeaseStatus.countsAsOccupancy).
   * Records the transition in UnitOccupancyHistory and resyncs Building/Property
   * counters — all within the caller's transaction.
   */
  async syncUnitOccupancy(
    db: PrismaDb,
    unitId: string,
    hasActiveLease: boolean,
    actorId?: string,
    reason?: string,
  ): Promise<void> {
    const unit = await db.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        propertyId: true,
        buildingId: true,
        availability: true,
        deletedAt: true,
        isActive: true,
        isReserved: true,
        isBlocked: true,
      },
    });
    if (!unit) return;

    const previous = unit.availability;
    const next = this.availability.computeFor(unit, { hasActiveLease });
    if (next === previous) return;

    await db.unit.update({ where: { id: unitId }, data: { availability: next } });
    await this.unitEvents.recordOccupancy(db, unitId, previous, next, actorId, reason);
    await this.counts.syncForUnit(db, unit.propertyId, unit.buildingId);
  }
}
