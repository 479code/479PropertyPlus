import { Injectable } from '@nestjs/common';
import { type Organization } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { type PrismaDb } from '../rbac/rbac.repository';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Accepts an optional transaction client so signup can create the org atomically. */
  create(
    data: { name: string; slug: string; createdBy?: string },
    db: PrismaDb = this.prisma,
  ): Promise<Organization> {
    return db.organization.create({ data });
  }

  findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({ where: { id, deletedAt: null } });
  }

  findBySlug(slug: string): Promise<Organization | null> {
    return this.prisma.organization.findFirst({ where: { slug, deletedAt: null } });
  }

  findManyAndCount(skip: number, take: number): Promise<[Organization[], number]> {
    const where = { deletedAt: null };
    return Promise.all([
      this.prisma.organization.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.organization.count({ where }),
    ]);
  }

  update(
    id: string,
    data: Partial<{ name: string; isActive: boolean; updatedBy: string }>,
  ): Promise<Organization> {
    return this.prisma.organization.update({ where: { id }, data });
  }

  softDelete(id: string, updatedBy?: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy },
    });
  }
}
