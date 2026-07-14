import { Injectable } from '@nestjs/common';
import { type PersonTag, type PersonType } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

interface NamedCreate {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}
interface TagCreate {
  name: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class CrmConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrganizationIds(): Promise<Array<{ id: string }>> {
    return this.prisma.organization.findMany({
      where: { deletedAt: null },
      select: { id: true },
    }) as Promise<Array<{ id: string }>>;
  }

  // ── PersonType ──
  listPersonTypes(organizationId: string): Promise<PersonType[]> {
    return this.prisma.personType.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  countPersonTypes(organizationId: string): Promise<number> {
    return this.prisma.personType.count({ where: { organizationId, deletedAt: null } });
  }
  findPersonType(organizationId: string, id: string): Promise<PersonType | null> {
    return this.prisma.personType.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findPersonTypeByName(organizationId: string, name: string): Promise<PersonType | null> {
    return this.prisma.personType.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createPersonType(
    organizationId: string,
    data: NamedCreate,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<PersonType> {
    return db.personType.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }
  updatePersonType(id: string, data: Partial<NamedCreate>, actorId?: string): Promise<PersonType> {
    return this.prisma.personType.update({ where: { id }, data: { ...data, updatedBy: actorId } });
  }
  softDeletePersonType(id: string, actorId?: string): Promise<PersonType> {
    return this.prisma.personType.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }

  // ── PersonTag ──
  listPersonTags(organizationId: string): Promise<PersonTag[]> {
    return this.prisma.personTag.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
  countPersonTags(organizationId: string): Promise<number> {
    return this.prisma.personTag.count({ where: { organizationId, deletedAt: null } });
  }
  findPersonTag(organizationId: string, id: string): Promise<PersonTag | null> {
    return this.prisma.personTag.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findPersonTagByName(organizationId: string, name: string): Promise<PersonTag | null> {
    return this.prisma.personTag.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createPersonTag(
    organizationId: string,
    data: TagCreate,
    actorId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<PersonTag> {
    return db.personTag.create({
      data: {
        organizationId,
        name: data.name,
        color: data.color,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }
  updatePersonTag(id: string, data: Partial<TagCreate>, actorId?: string): Promise<PersonTag> {
    return this.prisma.personTag.update({ where: { id }, data: { ...data, updatedBy: actorId } });
  }
  softDeletePersonTag(id: string, actorId?: string): Promise<PersonTag> {
    return this.prisma.personTag.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }
}
