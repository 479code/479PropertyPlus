import { Injectable } from '@nestjs/common';
import {
  type PropertyFeature,
  type PropertyStatus,
  type PropertyTag,
  type PropertyType,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

@Injectable()
export class PropertyConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── PropertyType ──
  listTypes(organizationId: string): Promise<PropertyType[]> {
    return this.prisma.propertyType.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  findType(organizationId: string, id: string): Promise<PropertyType | null> {
    return this.prisma.propertyType.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findTypeByName(organizationId: string, name: string): Promise<PropertyType | null> {
    return this.prisma.propertyType.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createType(
    organizationId: string,
    data: Record<string, unknown>,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<PropertyType> {
    return db.propertyType.create({
      data: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
    });
  }
  updateType(id: string, data: Record<string, unknown>, actorId?: string): Promise<PropertyType> {
    return this.prisma.propertyType.update({
      where: { id },
      data: { ...data, updatedBy: actorId },
    });
  }
  softDeleteType(id: string, actorId?: string): Promise<PropertyType> {
    return this.prisma.propertyType.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  // ── PropertyStatus ──
  listStatuses(organizationId: string): Promise<PropertyStatus[]> {
    return this.prisma.propertyStatus.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  findStatus(organizationId: string, id: string): Promise<PropertyStatus | null> {
    return this.prisma.propertyStatus.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findStatusByName(organizationId: string, name: string): Promise<PropertyStatus | null> {
    return this.prisma.propertyStatus.findFirst({
      where: { organizationId, name, deletedAt: null },
    });
  }
  createStatus(
    organizationId: string,
    data: Record<string, unknown>,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<PropertyStatus> {
    return db.propertyStatus.create({
      data: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
    });
  }
  updateStatus(
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<PropertyStatus> {
    return this.prisma.propertyStatus.update({
      where: { id },
      data: { ...data, updatedBy: actorId },
    });
  }
  softDeleteStatus(id: string, actorId?: string): Promise<PropertyStatus> {
    return this.prisma.propertyStatus.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  // ── PropertyFeature ──
  listFeatures(organizationId: string): Promise<PropertyFeature[]> {
    return this.prisma.propertyFeature.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  findFeature(organizationId: string, id: string): Promise<PropertyFeature | null> {
    return this.prisma.propertyFeature.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }
  findFeatureByName(organizationId: string, name: string): Promise<PropertyFeature | null> {
    return this.prisma.propertyFeature.findFirst({
      where: { organizationId, name, deletedAt: null },
    });
  }
  createFeature(
    organizationId: string,
    data: Record<string, unknown>,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<PropertyFeature> {
    return db.propertyFeature.create({
      data: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
    });
  }
  updateFeature(
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<PropertyFeature> {
    return this.prisma.propertyFeature.update({
      where: { id },
      data: { ...data, updatedBy: actorId },
    });
  }
  softDeleteFeature(id: string, actorId?: string): Promise<PropertyFeature> {
    return this.prisma.propertyFeature.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  // ── PropertyTag ──
  listTags(organizationId: string): Promise<PropertyTag[]> {
    return this.prisma.propertyTag.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
  findTag(organizationId: string, id: string): Promise<PropertyTag | null> {
    return this.prisma.propertyTag.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findTagByName(organizationId: string, name: string): Promise<PropertyTag | null> {
    return this.prisma.propertyTag.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createTag(
    organizationId: string,
    data: Record<string, unknown>,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<PropertyTag> {
    return db.propertyTag.create({
      data: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
    });
  }
  updateTag(id: string, data: Record<string, unknown>, actorId?: string): Promise<PropertyTag> {
    return this.prisma.propertyTag.update({ where: { id }, data: { ...data, updatedBy: actorId } });
  }
  softDeleteTag(id: string, actorId?: string): Promise<PropertyTag> {
    return this.prisma.propertyTag.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }
}
