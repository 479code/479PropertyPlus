import { Injectable } from '@nestjs/common';
import { type Building, type Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

export interface BuildingCreateData {
  organizationId: string;
  propertyId: string;
  buildingCode: string;
  name: string;
  description?: string | null;
  numberOfFloors?: number | null;
  yearBuilt?: number | null;
  statusId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

const RELATIONS = {
  status: true,
  property: { select: { id: true, name: true, propertyCode: true } },
} as const;

@Injectable()
export class BuildingRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: BuildingCreateData, db: PrismaDb = this.prisma): Promise<Building> {
    return db.building.create({ data });
  }

  findById(organizationId: string, id: string, includeArchived = false): Promise<Building | null> {
    return this.prisma.building.findFirst({
      where: { id, organizationId, ...(includeArchived ? {} : { deletedAt: null }) },
      include: RELATIONS,
    });
  }

  findByCode(organizationId: string, buildingCode: string): Promise<Building | null> {
    return this.prisma.building.findFirst({ where: { organizationId, buildingCode } });
  }

  list(
    organizationId: string,
    propertyId: string | undefined,
    skip: number,
    take: number,
  ): Promise<[Building[], number]> {
    const where: Prisma.BuildingWhereInput = { organizationId, deletedAt: null };
    if (propertyId) where.propertyId = propertyId;
    return Promise.all([
      this.prisma.building.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: RELATIONS,
      }),
      this.prisma.building.count({ where }),
    ]);
  }

  update(id: string, data: Prisma.BuildingUncheckedUpdateInput): Promise<Building> {
    return this.prisma.building.update({ where: { id }, data });
  }

  setDeletedAt(id: string, deletedAt: Date | null, actorId?: string): Promise<Building> {
    return this.prisma.building.update({
      where: { id },
      data: { deletedAt, updatedBy: actorId ?? null },
    });
  }

  countForProperty(organizationId: string, propertyId: string): Promise<number> {
    return this.prisma.building.count({ where: { organizationId, propertyId, deletedAt: null } });
  }

  /** Recompute a building's unit counts from its live units. */
  async recomputeCounts(
    db: PrismaDb,
    buildingId: string,
  ): Promise<{ totalUnits: number; occupiedUnits: number; vacantUnits: number }> {
    const [total, occupied] = await Promise.all([
      db.unit.count({ where: { buildingId, deletedAt: null } }),
      db.unit.count({ where: { buildingId, deletedAt: null, availability: 'OCCUPIED' } }),
    ]);
    const counts = {
      totalUnits: total,
      occupiedUnits: occupied,
      vacantUnits: Math.max(total - occupied, 0),
    };
    await db.building.update({ where: { id: buildingId }, data: counts });
    return counts;
  }
}
