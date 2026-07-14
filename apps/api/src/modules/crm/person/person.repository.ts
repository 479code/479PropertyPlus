import { Injectable } from '@nestjs/common';
import { type Person, type Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

export interface PersonCreateData {
  organizationId: string;
  personCode: string;
  slug: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  gender?: string | null;
  dateOfBirth?: Date | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  occupation?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  profilePhoto?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  identificationType?: string | null;
  identificationNumber?: string | null;
  identificationExpiry?: Date | null;
  taxIdentificationNumber?: string | null;
  notes?: string | null;
  isActive?: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface PersonSearchParams {
  organizationId: string;
  includeArchived?: boolean;
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  identificationNumber?: string;
  companyId?: string;
  personTypeId?: string;
  tagIds?: string[];
  isActive?: boolean;
  global?: string;
}

const RELATIONS = {
  roles: { include: { personType: true } },
  tagAssignments: { include: { tag: true } },
  tenantProfile: { include: { company: true } },
  ownerProfile: true,
  agentProfile: true,
} as const;

@Injectable()
export class PersonRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: PersonCreateData, db: PrismaDb = this.prisma): Promise<Person> {
    return db.person.create({ data });
  }

  findById(organizationId: string, id: string, includeArchived = false): Promise<Person | null> {
    return this.prisma.person.findFirst({
      where: { id, organizationId, ...(includeArchived ? {} : { deletedAt: null }) },
      include: RELATIONS,
    });
  }
  findBySlug(organizationId: string, slug: string): Promise<Person | null> {
    return this.prisma.person.findFirst({ where: { organizationId, slug } });
  }
  findByCode(organizationId: string, personCode: string): Promise<Person | null> {
    return this.prisma.person.findFirst({ where: { organizationId, personCode } });
  }

  buildWhere(p: PersonSearchParams): Prisma.PersonWhereInput {
    const where: Prisma.PersonWhereInput = { organizationId: p.organizationId };
    if (!p.includeArchived) where.deletedAt = null;
    if (p.isActive !== undefined) where.isActive = p.isActive;
    if (p.code) where.personCode = { contains: p.code, mode: 'insensitive' };
    if (p.name) where.fullName = { contains: p.name, mode: 'insensitive' };
    if (p.phone) where.phone = { contains: p.phone, mode: 'insensitive' };
    if (p.email) where.email = { contains: p.email, mode: 'insensitive' };
    if (p.identificationNumber)
      where.identificationNumber = { contains: p.identificationNumber, mode: 'insensitive' };
    if (p.companyId) where.tenantProfile = { companyId: p.companyId };
    if (p.personTypeId) where.roles = { some: { personTypeId: p.personTypeId } };

    const and: Prisma.PersonWhereInput[] = [];
    if (p.tagIds?.length)
      for (const tagId of p.tagIds) and.push({ tagAssignments: { some: { tagId } } });
    if (p.global) {
      and.push({
        OR: [
          { personCode: { contains: p.global, mode: 'insensitive' } },
          { fullName: { contains: p.global, mode: 'insensitive' } },
          { email: { contains: p.global, mode: 'insensitive' } },
          { phone: { contains: p.global, mode: 'insensitive' } },
        ],
      });
    }
    if (and.length) where.AND = and;
    return where;
  }

  search(
    where: Prisma.PersonWhereInput,
    orderBy: Prisma.PersonOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<[Person[], number]> {
    return Promise.all([
      this.prisma.person.findMany({ where, orderBy, skip, take, include: RELATIONS }),
      this.prisma.person.count({ where }),
    ]);
  }

  update(
    id: string,
    data: Prisma.PersonUncheckedUpdateInput,
    db: PrismaDb = this.prisma,
  ): Promise<Person> {
    return db.person.update({ where: { id }, data });
  }

  // ── Roles ──
  addRole(
    db: PrismaDb,
    personId: string,
    personTypeId: string,
    isPrimary = false,
  ): Promise<unknown> {
    return db.personRole.create({ data: { personId, personTypeId, isPrimary } });
  }
  removeRole(personId: string, personTypeId: string): Promise<{ count: number }> {
    return this.prisma.personRole.deleteMany({ where: { personId, personTypeId } });
  }
  replaceRoles(
    db: PrismaDb,
    personId: string,
    personTypeIds: string[],
    primaryPersonTypeId?: string,
  ): Promise<unknown> {
    return db.personRole.createMany({
      data: personTypeIds.map((personTypeId) => ({
        personId,
        personTypeId,
        isPrimary: personTypeId === primaryPersonTypeId,
      })),
    });
  }
  clearRoles(db: PrismaDb, personId: string): Promise<{ count: number }> {
    return db.personRole.deleteMany({ where: { personId } });
  }

  // ── Tags ──
  addTag(personId: string, tagId: string): Promise<unknown> {
    return this.prisma.personTagAssignment.create({ data: { personId, tagId } });
  }
  removeTag(personId: string, tagId: string): Promise<{ count: number }> {
    return this.prisma.personTagAssignment.deleteMany({ where: { personId, tagId } });
  }
}
