import { Injectable, NotFoundException } from '@nestjs/common';
import { type UnitAvailability } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

function num(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const n = Number((value as { toString(): string }).toString());
  return Number.isFinite(n) ? n : 0;
}
function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
}

export interface BuildingSummary {
  building: {
    id: string;
    name: string;
    buildingCode: string;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
  };
  floors: Array<{ id: string; name: string; floorNumber: number | null }>;
  units: { total: number; byAvailability: Record<string, number> };
  occupancyRate: number;
  revenue: { expectedAnnual: number; current: number };
}

export interface PropertyInventorySummary {
  totalBuildings: number;
  totalFloors: number;
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  reservedUnits: number;
  maintenanceUnits: number;
  vacantUnits: number;
  expectedRevenue: number;
  occupancyPercentage: number;
  vacancyPercentage: number;
}

@Injectable()
export class InventorySummaryService {
  constructor(private readonly prisma: PrismaService) {}

  private async availabilityCounts(where: {
    organizationId: string;
    propertyId?: string;
    buildingId?: string;
  }): Promise<Record<string, number>> {
    const rows: Array<{ availability: UnitAvailability; _count: number }> =
      await this.prisma.unit.groupBy({
        by: ['availability'],
        where: { ...where, deletedAt: null },
        _count: true,
      });
    const out: Record<string, number> = {};
    for (const r of rows) out[r.availability] = r._count;
    return out;
  }

  async buildingSummary(organizationId: string, buildingId: string): Promise<BuildingSummary> {
    const building = await this.prisma.building.findFirst({
      where: { id: buildingId, organizationId, deletedAt: null },
    });
    if (!building) throw new NotFoundException(`Building ${buildingId} not found`);

    const [floors, byAvailability, revenue] = await Promise.all([
      this.prisma.floor.findMany({
        where: { organizationId, buildingId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, floorNumber: true },
      }),
      this.availabilityCounts({ organizationId, buildingId }),
      this.prisma.unit.aggregate({
        where: { organizationId, buildingId, deletedAt: null },
        _sum: { expectedAnnualRevenue: true, monthlyRent: true },
      }),
    ]);

    const total = Object.values(byAvailability).reduce((a, b) => a + b, 0);
    const b = building as {
      id: string;
      name: string;
      buildingCode: string;
      totalUnits: number;
      occupiedUnits: number;
      vacantUnits: number;
    };
    return {
      building: {
        id: b.id,
        name: b.name,
        buildingCode: b.buildingCode,
        totalUnits: b.totalUnits,
        occupiedUnits: b.occupiedUnits,
        vacantUnits: b.vacantUnits,
      },
      floors: floors as Array<{ id: string; name: string; floorNumber: number | null }>,
      units: { total, byAvailability },
      occupancyRate: pct(byAvailability.OCCUPIED ?? 0, total),
      revenue: {
        expectedAnnual: num(revenue._sum.expectedAnnualRevenue),
        current: num(revenue._sum.monthlyRent) * 12,
      },
    };
  }

  async propertyInventorySummary(
    organizationId: string,
    propertyId: string,
  ): Promise<PropertyInventorySummary> {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, organizationId, deletedAt: null },
    });
    if (!property) throw new NotFoundException(`Property ${propertyId} not found`);

    const [totalBuildings, totalFloors, byAvailability, revenue] = await Promise.all([
      this.prisma.building.count({ where: { organizationId, propertyId, deletedAt: null } }),
      this.prisma.floor.count({
        where: { organizationId, building: { propertyId }, deletedAt: null },
      }),
      this.availabilityCounts({ organizationId, propertyId }),
      this.prisma.unit.aggregate({
        where: { organizationId, propertyId, deletedAt: null },
        _sum: { expectedAnnualRevenue: true },
      }),
    ]);

    const occupied = byAvailability.OCCUPIED ?? 0;
    const available = byAvailability.AVAILABLE ?? 0;
    const reserved = byAvailability.RESERVED ?? 0;
    const maintenance = byAvailability.UNDER_MAINTENANCE ?? 0;
    const totalUnits = Object.values(byAvailability).reduce((a, b) => a + b, 0);
    const vacant = Math.max(totalUnits - occupied, 0);

    return {
      totalBuildings,
      totalFloors,
      totalUnits,
      availableUnits: available,
      occupiedUnits: occupied,
      reservedUnits: reserved,
      maintenanceUnits: maintenance,
      vacantUnits: vacant,
      expectedRevenue: num(revenue._sum.expectedAnnualRevenue),
      occupancyPercentage: pct(occupied, totalUnits),
      vacancyPercentage: pct(vacant, totalUnits),
    };
  }
}
