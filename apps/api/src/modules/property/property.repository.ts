import { Injectable } from '@nestjs/common';
import { type Prisma, type Property } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { type PrismaDb } from '../rbac/rbac.repository';

export interface PropertySearchWhere {
  organizationId: string;
  includeArchived?: boolean;
  code?: string;
  name?: string;
  address?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  districtId?: string;
  areaId?: string;
  propertyTypeId?: string;
  statusId?: string;
  googlePlaceId?: string;
  isActive?: boolean;
  featureIds?: string[];
  tagIds?: string[];
  purchasePriceMin?: number;
  purchasePriceMax?: number;
  marketValueMin?: number;
  marketValueMax?: number;
  revenueMin?: number;
  revenueMax?: number;
}

const RELATIONS = {
  propertyType: true,
  status: true,
  country: true,
  state: true,
  city: true,
  district: true,
  area: true,
  images: true,
  features: { include: { feature: true } },
  tags: { include: { tag: true } },
} as const;

function range(min?: number, max?: number): Prisma.DecimalFilter | undefined {
  if (min === undefined && max === undefined) return undefined;
  const f: Prisma.DecimalFilter = {};
  if (min !== undefined) f.gte = min;
  if (max !== undefined) f.lte = max;
  return f;
}

@Injectable()
export class PropertyRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhere(w: PropertySearchWhere): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = { organizationId: w.organizationId };
    if (!w.includeArchived) where.deletedAt = null;
    if (w.code) where.propertyCode = { contains: w.code, mode: 'insensitive' };
    if (w.name) where.name = { contains: w.name, mode: 'insensitive' };
    if (w.address) where.streetAddress = { contains: w.address, mode: 'insensitive' };
    if (w.countryId) where.countryId = w.countryId;
    if (w.stateId) where.stateId = w.stateId;
    if (w.cityId) where.cityId = w.cityId;
    if (w.districtId) where.districtId = w.districtId;
    if (w.areaId) where.areaId = w.areaId;
    if (w.propertyTypeId) where.propertyTypeId = w.propertyTypeId;
    if (w.statusId) where.statusId = w.statusId;
    if (w.googlePlaceId) where.googlePlaceId = w.googlePlaceId;
    if (w.isActive !== undefined) where.isActive = w.isActive;

    const purchasePrice = range(w.purchasePriceMin, w.purchasePriceMax);
    if (purchasePrice) where.purchasePrice = purchasePrice;
    const marketValue = range(w.marketValueMin, w.marketValueMax);
    if (marketValue) where.marketValue = marketValue;
    const revenue = range(w.revenueMin, w.revenueMax);
    if (revenue) where.expectedAnnualRevenue = revenue;

    const and: Prisma.PropertyWhereInput[] = [];
    if (w.featureIds?.length) {
      for (const featureId of w.featureIds) and.push({ features: { some: { featureId } } });
    }
    if (w.tagIds?.length) {
      and.push({ tags: { some: { tagId: { in: w.tagIds } } } });
    }
    if (and.length) where.AND = and;
    return where;
  }

  search(
    where: Prisma.PropertyWhereInput,
    orderBy: Prisma.PropertyOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<[Property[], number]> {
    return Promise.all([
      this.prisma.property.findMany({ where, orderBy, skip, take, include: RELATIONS }),
      this.prisma.property.count({ where }),
    ]);
  }

  findById(organizationId: string, id: string, includeArchived = false): Promise<Property | null> {
    return this.prisma.property.findFirst({
      where: { id, organizationId, ...(includeArchived ? {} : { deletedAt: null }) },
      include: RELATIONS,
    });
  }

  findBySlug(organizationId: string, slug: string): Promise<Property | null> {
    return this.prisma.property.findFirst({ where: { organizationId, slug } });
  }

  findByCode(organizationId: string, propertyCode: string): Promise<Property | null> {
    return this.prisma.property.findFirst({ where: { organizationId, propertyCode } });
  }

  create(data: Prisma.PropertyUncheckedCreateInput, db: PrismaDb = this.prisma): Promise<Property> {
    return db.property.create({ data });
  }

  update(id: string, data: Prisma.PropertyUncheckedUpdateInput): Promise<Property> {
    return this.prisma.property.update({ where: { id }, data });
  }

  setDeletedAt(id: string, deletedAt: Date | null, actorId?: string): Promise<Property> {
    return this.prisma.property.update({
      where: { id },
      data: { deletedAt, updatedBy: actorId ?? null },
    });
  }

  // ── feature / tag assignments ──
  replaceFeatures(db: PrismaDb, propertyId: string, featureIds: string[]): Promise<unknown> {
    return db.propertyFeatureAssignment.createMany({
      data: featureIds.map((featureId) => ({ propertyId, featureId })),
    });
  }
  clearFeatures(db: PrismaDb, propertyId: string): Promise<{ count: number }> {
    return db.propertyFeatureAssignment.deleteMany({ where: { propertyId } });
  }
  replaceTags(db: PrismaDb, propertyId: string, tagIds: string[]): Promise<unknown> {
    return db.propertyTagAssignment.createMany({
      data: tagIds.map((tagId) => ({ propertyId, tagId })),
    });
  }
  clearTags(db: PrismaDb, propertyId: string): Promise<{ count: number }> {
    return db.propertyTagAssignment.deleteMany({ where: { propertyId } });
  }

  // ── dashboard ──
  countByOrg(organizationId: string, deletedAt: null | { not: null }): Promise<number> {
    return this.prisma.property.count({ where: { organizationId, deletedAt } });
  }
  groupByStatus(organizationId: string): Promise<Array<{ statusId: string; _count: number }>> {
    return this.prisma.property
      .groupBy({ by: ['statusId'], where: { organizationId, deletedAt: null }, _count: true })
      .then((rows: Array<{ statusId: string; _count: number }>) => rows);
  }
  groupByType(organizationId: string): Promise<Array<{ propertyTypeId: string; _count: number }>> {
    return this.prisma.property
      .groupBy({ by: ['propertyTypeId'], where: { organizationId, deletedAt: null }, _count: true })
      .then((rows: Array<{ propertyTypeId: string; _count: number }>) => rows);
  }
  aggregate(
    organizationId: string,
  ): Promise<{
    _sum: {
      marketValue: unknown;
      expectedAnnualRevenue: unknown;
      totalUnits: number | null;
      occupiedUnits: number | null;
    };
  }> {
    return this.prisma.property.aggregate({
      where: { organizationId, deletedAt: null },
      _sum: {
        marketValue: true,
        expectedAnnualRevenue: true,
        totalUnits: true,
        occupiedUnits: true,
      },
    });
  }
}
