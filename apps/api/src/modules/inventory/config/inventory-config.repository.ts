import { Injectable } from '@nestjs/common';
import {
  type BuildingStatus,
  type UnitFeature,
  type UnitStatus,
  type UnitType,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

interface StatusCreate {
  name: string;
  color?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}
interface TypeCreate {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}
interface FeatureCreate {
  name: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class InventoryConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrganizationIds(): Promise<Array<{ id: string }>> {
    return this.prisma.organization.findMany({
      where: { deletedAt: null },
      select: { id: true },
    }) as Promise<Array<{ id: string }>>;
  }

  // ── BuildingStatus ──
  listBuildingStatuses(organizationId: string): Promise<BuildingStatus[]> {
    return this.prisma.buildingStatus.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  countBuildingStatuses(organizationId: string): Promise<number> {
    return this.prisma.buildingStatus.count({ where: { organizationId, deletedAt: null } });
  }
  findBuildingStatus(organizationId: string, id: string): Promise<BuildingStatus | null> {
    return this.prisma.buildingStatus.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findBuildingStatusByName(organizationId: string, name: string): Promise<BuildingStatus | null> {
    return this.prisma.buildingStatus.findFirst({
      where: { organizationId, name, deletedAt: null },
    });
  }
  createBuildingStatus(
    organizationId: string,
    data: StatusCreate,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<BuildingStatus> {
    return db.buildingStatus.create({
      data: {
        organizationId,
        name: data.name,
        color: data.color,
        description: data.description,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }
  updateBuildingStatus(
    id: string,
    data: Partial<StatusCreate>,
    actorId?: string,
  ): Promise<BuildingStatus> {
    return this.prisma.buildingStatus.update({
      where: { id },
      data: { ...data, updatedBy: actorId },
    });
  }
  softDeleteBuildingStatus(id: string, actorId?: string): Promise<BuildingStatus> {
    return this.prisma.buildingStatus.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  // ── UnitType ──
  listUnitTypes(organizationId: string): Promise<UnitType[]> {
    return this.prisma.unitType.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  countUnitTypes(organizationId: string): Promise<number> {
    return this.prisma.unitType.count({ where: { organizationId, deletedAt: null } });
  }
  findUnitType(organizationId: string, id: string): Promise<UnitType | null> {
    return this.prisma.unitType.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findUnitTypeByName(organizationId: string, name: string): Promise<UnitType | null> {
    return this.prisma.unitType.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createUnitType(
    organizationId: string,
    data: TypeCreate,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<UnitType> {
    return db.unitType.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }
  updateUnitType(id: string, data: Partial<TypeCreate>, actorId?: string): Promise<UnitType> {
    return this.prisma.unitType.update({ where: { id }, data: { ...data, updatedBy: actorId } });
  }
  softDeleteUnitType(id: string, actorId?: string): Promise<UnitType> {
    return this.prisma.unitType.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  // ── UnitStatus ──
  listUnitStatuses(organizationId: string): Promise<UnitStatus[]> {
    return this.prisma.unitStatus.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  countUnitStatuses(organizationId: string): Promise<number> {
    return this.prisma.unitStatus.count({ where: { organizationId, deletedAt: null } });
  }
  findUnitStatus(organizationId: string, id: string): Promise<UnitStatus | null> {
    return this.prisma.unitStatus.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findUnitStatusByName(organizationId: string, name: string): Promise<UnitStatus | null> {
    return this.prisma.unitStatus.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createUnitStatus(
    organizationId: string,
    data: StatusCreate,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<UnitStatus> {
    return db.unitStatus.create({
      data: {
        organizationId,
        name: data.name,
        color: data.color,
        description: data.description,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }
  updateUnitStatus(id: string, data: Partial<StatusCreate>, actorId?: string): Promise<UnitStatus> {
    return this.prisma.unitStatus.update({ where: { id }, data: { ...data, updatedBy: actorId } });
  }
  softDeleteUnitStatus(id: string, actorId?: string): Promise<UnitStatus> {
    return this.prisma.unitStatus.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  // ── UnitFeature ──
  listUnitFeatures(organizationId: string): Promise<UnitFeature[]> {
    return this.prisma.unitFeature.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  countUnitFeatures(organizationId: string): Promise<number> {
    return this.prisma.unitFeature.count({ where: { organizationId, deletedAt: null } });
  }
  findUnitFeature(organizationId: string, id: string): Promise<UnitFeature | null> {
    return this.prisma.unitFeature.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findUnitFeatureByName(organizationId: string, name: string): Promise<UnitFeature | null> {
    return this.prisma.unitFeature.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createUnitFeature(
    organizationId: string,
    data: FeatureCreate,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<UnitFeature> {
    return db.unitFeature.create({
      data: {
        organizationId,
        name: data.name,
        icon: data.icon,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }
  updateUnitFeature(
    id: string,
    data: Partial<FeatureCreate>,
    actorId?: string,
  ): Promise<UnitFeature> {
    return this.prisma.unitFeature.update({ where: { id }, data: { ...data, updatedBy: actorId } });
  }
  softDeleteUnitFeature(id: string, actorId?: string): Promise<UnitFeature> {
    return this.prisma.unitFeature.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }
}
