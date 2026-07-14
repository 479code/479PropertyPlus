import { Injectable } from '@nestjs/common';
import { type LeaseGuarantor } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

export interface LeaseGuarantorData {
  personId: string;
  guaranteeType?: string;
  guaranteeAmount?: number;
  relationshipToTenant?: string;
  status?: string;
  notes?: string;
}

const RELATIONS = {
  person: { select: { id: true, fullName: true, personCode: true, email: true, phone: true } },
} as const;

@Injectable()
export class LeaseGuarantorRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(leaseId: string): Promise<LeaseGuarantor[]> {
    return this.prisma.leaseGuarantor.findMany({ where: { leaseId }, include: RELATIONS });
  }

  findById(leaseId: string, id: string): Promise<LeaseGuarantor | null> {
    return this.prisma.leaseGuarantor.findFirst({ where: { id, leaseId }, include: RELATIONS });
  }

  findByPerson(leaseId: string, personId: string): Promise<LeaseGuarantor | null> {
    return this.prisma.leaseGuarantor.findUnique({
      where: { leaseId_personId: { leaseId, personId } },
    });
  }

  create(
    leaseId: string,
    data: LeaseGuarantorData,
    db: PrismaDb = this.prisma,
  ): Promise<LeaseGuarantor> {
    return db.leaseGuarantor.create({ data: { leaseId, ...data }, include: RELATIONS });
  }

  update(id: string, data: Partial<LeaseGuarantorData>): Promise<LeaseGuarantor> {
    return this.prisma.leaseGuarantor.update({ where: { id }, data, include: RELATIONS });
  }

  remove(id: string): Promise<LeaseGuarantor> {
    return this.prisma.leaseGuarantor.delete({ where: { id } });
  }
}
