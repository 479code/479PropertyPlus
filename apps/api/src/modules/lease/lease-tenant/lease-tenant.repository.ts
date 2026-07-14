import { Injectable } from '@nestjs/common';
import { type LeaseTenant, type LeaseTenantRole } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

export interface LeaseTenantData {
  personId: string;
  role?: LeaseTenantRole;
  ownershipPercentage?: number;
}

const RELATIONS = {
  person: { select: { id: true, fullName: true, personCode: true, email: true, phone: true } },
} as const;

@Injectable()
export class LeaseTenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(leaseId: string): Promise<LeaseTenant[]> {
    return this.prisma.leaseTenant.findMany({ where: { leaseId }, include: RELATIONS });
  }

  findById(leaseId: string, id: string): Promise<LeaseTenant | null> {
    return this.prisma.leaseTenant.findFirst({ where: { id, leaseId }, include: RELATIONS });
  }

  findByPerson(leaseId: string, personId: string): Promise<LeaseTenant | null> {
    return this.prisma.leaseTenant.findUnique({
      where: { leaseId_personId: { leaseId, personId } },
    });
  }

  create(leaseId: string, data: LeaseTenantData, db: PrismaDb = this.prisma): Promise<LeaseTenant> {
    return db.leaseTenant.create({ data: { leaseId, ...data }, include: RELATIONS });
  }

  update(id: string, data: Partial<LeaseTenantData>): Promise<LeaseTenant> {
    return this.prisma.leaseTenant.update({ where: { id }, data, include: RELATIONS });
  }

  remove(id: string): Promise<LeaseTenant> {
    return this.prisma.leaseTenant.delete({ where: { id } });
  }
}
