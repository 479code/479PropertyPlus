import { Injectable } from '@nestjs/common';

import { type PrismaDb } from '../../rbac/rbac.repository';

/**
 * Keeps the denormalized occupancy counts on Building and Property in sync.
 * Called transactionally whenever a unit is created, updated, moved, archived,
 * restored, or changes availability. No scheduled jobs — dashboards read the
 * cached values these methods maintain.
 */
@Injectable()
export class CountsService {
  /** Recompute a single building's unit counts from its live units. */
  async syncBuilding(db: PrismaDb, buildingId: string): Promise<void> {
    const [total, occupied] = await Promise.all([
      db.unit.count({ where: { buildingId, deletedAt: null } }),
      db.unit.count({ where: { buildingId, deletedAt: null, availability: 'OCCUPIED' } }),
    ]);
    await db.building.update({
      where: { id: buildingId },
      data: {
        totalUnits: total,
        occupiedUnits: occupied,
        vacantUnits: Math.max(total - occupied, 0),
      },
    });
  }

  /** Recompute a property's building + unit counts from its live children. */
  async syncProperty(db: PrismaDb, propertyId: string): Promise<void> {
    const [totalBuildings, totalUnits, occupiedUnits] = await Promise.all([
      db.building.count({ where: { propertyId, deletedAt: null } }),
      db.unit.count({ where: { propertyId, deletedAt: null } }),
      db.unit.count({ where: { propertyId, deletedAt: null, availability: 'OCCUPIED' } }),
    ]);
    await db.property.update({
      where: { id: propertyId },
      data: {
        totalBuildings,
        totalUnits,
        occupiedUnits,
        vacantUnits: Math.max(totalUnits - occupiedUnits, 0),
      },
    });
  }

  /** Sync both a unit's building (if any) and its property in one pass. */
  async syncForUnit(
    db: PrismaDb,
    propertyId: string,
    buildingId: string | null | undefined,
  ): Promise<void> {
    if (buildingId) await this.syncBuilding(db, buildingId);
    await this.syncProperty(db, propertyId);
  }
}
