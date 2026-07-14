import { Injectable } from '@nestjs/common';
import { type Lease, type Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

export interface LeaseCreateData {
  organizationId: string;
  leaseNumber: string;
  leaseReference?: string;
  slug: string;
  propertyId: string;
  buildingId?: string | null;
  unitId: string;
  primaryTenantId: string;
  leaseTypeId: string;
  leaseStatusId: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
  moveInDate?: Date | null;
  moveOutDate?: Date | null;
  leaseDurationMonths?: number;
  renewalNoticeDays?: number;
  gracePeriodDays?: number;
  securityDeposit?: number;
  monthlyRent?: number;
  annualRent?: number;
  serviceCharge?: number;
  utilityCharge?: number;
  parkingCharge?: number;
  discount?: number;
  taxAmount?: number;
  totalRecurringAmount?: number;
  paymentFrequencyId?: string;
  billingCycle?: string;
  nextInvoiceDate?: Date;
  autoRenew?: boolean;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface LeaseSearchParams {
  organizationId: string;
  leaseNumber?: string;
  tenantName?: string;
  propertyId?: string;
  buildingId?: string;
  unitId?: string;
  leaseStatusId?: string;
  leaseTypeId?: string;
  paymentFrequencyId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  expiringInDays?: number;
  activeAndRenewalStatusIds?: string[];
  global?: string;
  includeArchived?: boolean;
}

const RELATIONS = {
  property: { select: { id: true, name: true, propertyCode: true } },
  building: { select: { id: true, name: true, buildingCode: true } },
  unit: { select: { id: true, name: true, unitCode: true } },
  primaryTenant: {
    select: { id: true, fullName: true, personCode: true, email: true, phone: true },
  },
  leaseType: true,
  leaseStatus: true,
  paymentFrequency: true,
  tenants: { include: { person: { select: { id: true, fullName: true, personCode: true } } } },
  guarantors: { include: { person: { select: { id: true, fullName: true, personCode: true } } } },
} as const;

@Injectable()
export class LeaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: LeaseCreateData, db: PrismaDb = this.prisma): Promise<Lease> {
    return db.lease.create({ data, include: RELATIONS });
  }

  findById(organizationId: string, id: string, includeArchived = false): Promise<Lease | null> {
    return this.prisma.lease.findFirst({
      where: { id, organizationId, ...(includeArchived ? {} : { deletedAt: null }) },
      include: RELATIONS,
    });
  }

  findByNumber(organizationId: string, leaseNumber: string): Promise<Lease | null> {
    return this.prisma.lease.findFirst({ where: { organizationId, leaseNumber } });
  }

  findBySlug(organizationId: string, slug: string): Promise<Lease | null> {
    return this.prisma.lease.findFirst({ where: { organizationId, slug } });
  }

  buildWhere(p: LeaseSearchParams): Prisma.LeaseWhereInput {
    const where: Record<string, unknown> = {
      organizationId: p.organizationId,
      ...(p.includeArchived ? {} : { deletedAt: null }),
    };
    if (p.leaseNumber) where.leaseNumber = { contains: p.leaseNumber, mode: 'insensitive' };
    if (p.propertyId) where.propertyId = p.propertyId;
    if (p.buildingId) where.buildingId = p.buildingId;
    if (p.unitId) where.unitId = p.unitId;
    if (p.leaseStatusId) where.leaseStatusId = p.leaseStatusId;
    if (p.leaseTypeId) where.leaseTypeId = p.leaseTypeId;
    if (p.paymentFrequencyId) where.paymentFrequencyId = p.paymentFrequencyId;
    if (p.tenantName) {
      where.primaryTenant = { fullName: { contains: p.tenantName, mode: 'insensitive' } };
    }

    const startRange: Record<string, Date> = {};
    if (p.startDateFrom) startRange.gte = new Date(p.startDateFrom);
    if (p.startDateTo) startRange.lte = new Date(p.startDateTo);
    if (Object.keys(startRange).length > 0) where.leaseStartDate = startRange;

    const endRange: Record<string, Date> = {};
    if (p.endDateFrom) endRange.gte = new Date(p.endDateFrom);
    if (p.endDateTo) endRange.lte = new Date(p.endDateTo);
    if (p.expiringInDays !== undefined) {
      const now = new Date();
      const until = new Date(now.getTime() + p.expiringInDays * 24 * 60 * 60 * 1000);
      endRange.gte = now;
      endRange.lte = until;
      if (p.activeAndRenewalStatusIds?.length)
        where.leaseStatusId = { in: p.activeAndRenewalStatusIds };
    }
    if (Object.keys(endRange).length > 0) where.leaseEndDate = endRange;

    const and: Record<string, unknown>[] = [];
    if (p.global) {
      and.push({
        OR: [
          { leaseNumber: { contains: p.global, mode: 'insensitive' } },
          { leaseReference: { contains: p.global, mode: 'insensitive' } },
          { primaryTenant: { fullName: { contains: p.global, mode: 'insensitive' } } },
        ],
      });
    }
    if (and.length > 0) where.AND = and;

    return where as Prisma.LeaseWhereInput;
  }

  async search(
    where: Prisma.LeaseWhereInput,
    orderBy: Prisma.LeaseOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<[Lease[], number]> {
    return Promise.all([
      this.prisma.lease.findMany({ where, orderBy, skip, take, include: RELATIONS }),
      this.prisma.lease.count({ where }),
    ]);
  }

  update(id: string, data: Record<string, unknown>, db: PrismaDb = this.prisma): Promise<Lease> {
    return db.lease.update({ where: { id }, data, include: RELATIONS });
  }

  /**
   * Leases on the same unit, in one of the given (blocking) statuses, whose
   * date range overlaps [startDate, endDate]. Used at Pending Approval /
   * Awaiting Signature / Active transitions per the approved architecture —
   * never at Draft, since Draft leases don't reserve inventory.
   */
  findOverlappingBlockingLeases(
    unitId: string,
    startDate: Date,
    endDate: Date,
    blockingStatusIds: string[],
    excludeLeaseId?: string,
    db: PrismaDb = this.prisma,
  ): Promise<Lease[]> {
    return db.lease.findMany({
      where: {
        unitId,
        deletedAt: null,
        leaseStatusId: { in: blockingStatusIds },
        leaseStartDate: { lte: endDate },
        leaseEndDate: { gte: startDate },
        ...(excludeLeaseId ? { id: { not: excludeLeaseId } } : {}),
      },
    });
  }

  /** The single lease currently making a unit read as occupied, if any (status.countsAsOccupancy = true). */
  findOccupyingLeaseForUnit(
    unitId: string,
    occupancyStatusIds: string[],
    db: PrismaDb = this.prisma,
  ): Promise<Lease | null> {
    return db.lease.findFirst({
      where: { unitId, deletedAt: null, leaseStatusId: { in: occupancyStatusIds } },
    });
  }

  /** Leases expiring due to end date but still sitting in a blocking status — for the automatic-expiry job. */
  findLeasesPastEndDate(statusIds: string[], asOf: Date): Promise<Lease[]> {
    return this.prisma.lease.findMany({
      where: { deletedAt: null, leaseStatusId: { in: statusIds }, leaseEndDate: { lt: asOf } },
    });
  }
}
