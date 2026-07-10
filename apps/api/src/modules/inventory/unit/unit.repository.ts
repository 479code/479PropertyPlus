import { Injectable } from '@nestjs/common';
import {
  type Prisma,
  type Unit,
  type UnitAvailability,
  type PropertyOwnerType,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

export interface UnitCreateData {
  organizationId: string;
  propertyId: string;
  buildingId?: string | null;
  floorId?: string | null;
  unitCode: string;
  slug: string;
  name: string;
  description?: string | null;
  unitTypeId: string;
  statusId: string;
  availability: UnitAvailability;
  isReserved?: boolean;
  isBlocked?: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  kitchens?: number | null;
  parkingSpaces?: number | null;
  size?: number | null;
  sizeUnit?: string | null;
  monthlyRent?: number | null;
  annualRent?: number | null;
  securityDeposit?: number | null;
  serviceCharge?: number | null;
  expectedAnnualRevenue?: number | null;
  marketValue?: number | null;
  ownerType?: PropertyOwnerType | null;
  ownerReferenceId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isRentable?: boolean;
  isActive?: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface UnitSearchParams {
  organizationId: string;
  includeArchived?: boolean;
  code?: string;
  name?: string;
  propertyId?: string;
  buildingId?: string;
  floorId?: string;
  unitTypeId?: string;
  statusId?: string;
  availability?: UnitAvailability;
  bedrooms?: number;
  bathrooms?: number;
  rentMin?: number;
  rentMax?: number;
  featureIds?: string[];
  global?: string;
}

const RELATIONS = {
  unitType: true,
  status: true,
  building: { select: { id: true, name: true, buildingCode: true } },
  floor: { select: { id: true, name: true } },
  features: { include: { feature: true } },
  images: true,
} as const;

function range(min?: number, max?: number): Prisma.DecimalFilter | undefined {
  if (min === undefined && max === undefined) return undefined;
  const f: Prisma.DecimalFilter = {};
  if (min !== undefined) f.gte = min;
  if (max !== undefined) f.lte = max;
  return f;
}

@Injectable()
export class UnitRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: UnitCreateData, db: PrismaDb = this.prisma): Promise<Unit> {
    return db.unit.create({ data });
  }

  findById(organizationId: string, id: string, includeArchived = false): Promise<Unit | null> {
    return this.prisma.unit.findFirst({
      where: { id, organizationId, ...(includeArchived ? {} : { deletedAt: null }) },
      include: RELATIONS,
    });
  }
  findBySlug(organizationId: string, slug: string): Promise<Unit | null> {
    return this.prisma.unit.findFirst({ where: { organizationId, slug } });
  }
  findByCode(organizationId: string, unitCode: string): Promise<Unit | null> {
    return this.prisma.unit.findFirst({ where: { organizationId, unitCode } });
  }

  buildWhere(p: UnitSearchParams): Prisma.UnitWhereInput {
    const where: Prisma.UnitWhereInput = { organizationId: p.organizationId };
    if (!p.includeArchived) where.deletedAt = null;
    if (p.propertyId) where.propertyId = p.propertyId;
    if (p.buildingId) where.buildingId = p.buildingId;
    if (p.floorId) where.floorId = p.floorId;
    if (p.unitTypeId) where.unitTypeId = p.unitTypeId;
    if (p.statusId) where.statusId = p.statusId;
    if (p.availability) where.availability = p.availability;
    if (p.bedrooms !== undefined) where.bedrooms = p.bedrooms;
    if (p.bathrooms !== undefined) where.bathrooms = p.bathrooms;
    if (p.code) where.unitCode = { contains: p.code, mode: 'insensitive' };
    if (p.name) where.name = { contains: p.name, mode: 'insensitive' };
    const rent = range(p.rentMin, p.rentMax);
    if (rent) where.monthlyRent = rent;

    const and: Prisma.UnitWhereInput[] = [];
    if (p.featureIds?.length)
      for (const featureId of p.featureIds) and.push({ features: { some: { featureId } } });
    if (p.global) {
      and.push({
        OR: [
          { unitCode: { contains: p.global, mode: 'insensitive' } },
          { name: { contains: p.global, mode: 'insensitive' } },
          { description: { contains: p.global, mode: 'insensitive' } },
        ],
      });
    }
    if (and.length) where.AND = and;
    return where;
  }

  search(
    where: Prisma.UnitWhereInput,
    orderBy: Prisma.UnitOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<[Unit[], number]> {
    return Promise.all([
      this.prisma.unit.findMany({ where, orderBy, skip, take, include: RELATIONS }),
      this.prisma.unit.count({ where }),
    ]);
  }

  update(
    id: string,
    data: Prisma.UnitUncheckedUpdateInput,
    db: PrismaDb = this.prisma,
  ): Promise<Unit> {
    return db.unit.update({ where: { id }, data });
  }

  replaceFeatures(db: PrismaDb, unitId: string, featureIds: string[]): Promise<unknown> {
    return db.unitFeatureAssignment.createMany({
      data: featureIds.map((featureId) => ({ unitId, featureId })),
    });
  }
  clearFeatures(db: PrismaDb, unitId: string): Promise<{ count: number }> {
    return db.unitFeatureAssignment.deleteMany({ where: { unitId } });
  }
}
