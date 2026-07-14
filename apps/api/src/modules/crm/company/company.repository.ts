import { Injectable } from '@nestjs/common';
import { type Company, type Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface CompanyCreateData {
  organizationId: string;
  companyName: string;
  registrationNumber?: string | null;
  taxNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  contactPersonId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

const RELATIONS = { contactPerson: true } as const;

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CompanyCreateData): Promise<Company> {
    return this.prisma.company.create({ data, include: RELATIONS });
  }

  findById(organizationId: string, id: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: RELATIONS,
    });
  }

  list(
    organizationId: string,
    name: string | undefined,
    skip: number,
    take: number,
  ): Promise<[Company[], number]> {
    const where: Prisma.CompanyWhereInput = {
      organizationId,
      deletedAt: null,
      ...(name ? { companyName: { contains: name, mode: 'insensitive' } } : {}),
    };
    return Promise.all([
      this.prisma.company.findMany({
        where,
        orderBy: { companyName: 'asc' },
        skip,
        take,
        include: RELATIONS,
      }),
      this.prisma.company.count({ where }),
    ]);
  }

  update(id: string, data: Prisma.CompanyUncheckedUpdateInput): Promise<Company> {
    return this.prisma.company.update({ where: { id }, data, include: RELATIONS });
  }

  softDelete(id: string, actorId?: string): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }
}
