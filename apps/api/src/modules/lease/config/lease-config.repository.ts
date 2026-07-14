import { Injectable } from '@nestjs/common';
import {
  type LeaseStateTransition,
  type LeaseStatus,
  type LeaseType,
  type PaymentFrequency,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface NamedConfigCreate {
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

@Injectable()
export class LeaseConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Lease types ──
  findLeaseTypeByName(organizationId: string, name: string): Promise<LeaseType | null> {
    return this.prisma.leaseType.findFirst({ where: { organizationId, name, deletedAt: null } });
  }
  createLeaseType(organizationId: string, data: NamedConfigCreate): Promise<LeaseType> {
    return this.prisma.leaseType.create({ data: { organizationId, ...data } });
  }
  listLeaseTypes(organizationId: string): Promise<LeaseType[]> {
    return this.prisma.leaseType.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }
  findLeaseTypeById(organizationId: string, id: string): Promise<LeaseType | null> {
    return this.prisma.leaseType.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  updateLeaseType(id: string, data: Partial<NamedConfigCreate>): Promise<LeaseType> {
    return this.prisma.leaseType.update({ where: { id }, data });
  }
  softDeleteLeaseType(id: string, actorId?: string): Promise<LeaseType> {
    return this.prisma.leaseType.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }
  countLeaseTypes(organizationId: string): Promise<number> {
    return this.prisma.leaseType.count({ where: { organizationId, deletedAt: null } });
  }

  // ── Payment frequencies ──
  findPaymentFrequencyByName(
    organizationId: string,
    name: string,
  ): Promise<PaymentFrequency | null> {
    return this.prisma.paymentFrequency.findFirst({
      where: { organizationId, name, deletedAt: null },
    });
  }
  createPaymentFrequency(
    organizationId: string,
    data: NamedConfigCreate,
  ): Promise<PaymentFrequency> {
    return this.prisma.paymentFrequency.create({ data: { organizationId, ...data } });
  }
  listPaymentFrequencies(organizationId: string): Promise<PaymentFrequency[]> {
    return this.prisma.paymentFrequency.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }
  findPaymentFrequencyById(organizationId: string, id: string): Promise<PaymentFrequency | null> {
    return this.prisma.paymentFrequency.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }
  updatePaymentFrequency(id: string, data: Partial<NamedConfigCreate>): Promise<PaymentFrequency> {
    return this.prisma.paymentFrequency.update({ where: { id }, data });
  }
  softDeletePaymentFrequency(id: string, actorId?: string): Promise<PaymentFrequency> {
    return this.prisma.paymentFrequency.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId },
    });
  }
  countPaymentFrequencies(organizationId: string): Promise<number> {
    return this.prisma.paymentFrequency.count({ where: { organizationId, deletedAt: null } });
  }

  // ── Lease statuses (system-backed: read + display-field update only) ──
  listLeaseStatuses(organizationId: string): Promise<LeaseStatus[]> {
    return this.prisma.leaseStatus.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }
  findLeaseStatusById(organizationId: string, id: string): Promise<LeaseStatus | null> {
    return this.prisma.leaseStatus.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  findLeaseStatusByKey(organizationId: string, key: string): Promise<LeaseStatus | null> {
    return this.prisma.leaseStatus.findUnique({
      where: { organizationId_key: { organizationId, key } },
    });
  }
  updateLeaseStatus(
    id: string,
    data: Partial<{
      name: string;
      color: string;
      description: string;
      displayOrder: number;
      isActive: boolean;
    }>,
  ): Promise<LeaseStatus> {
    return this.prisma.leaseStatus.update({ where: { id }, data });
  }
  countLeaseStatuses(organizationId: string): Promise<number> {
    return this.prisma.leaseStatus.count({ where: { organizationId, deletedAt: null } });
  }
  createLeaseStatus(
    organizationId: string,
    data: {
      key: string;
      name: string;
      color: string;
      displayOrder: number;
      blocksUnitAvailability: boolean;
      countsAsOccupancy: boolean;
    },
  ): Promise<LeaseStatus> {
    return this.prisma.leaseStatus.create({ data: { organizationId, isSystem: true, ...data } });
  }

  // ── State transitions ──
  countLeaseStateTransitions(organizationId: string): Promise<number> {
    return this.prisma.leaseStateTransition.count({ where: { organizationId } });
  }
  createLeaseStateTransition(
    organizationId: string,
    fromStatusId: string,
    toStatusId: string,
  ): Promise<LeaseStateTransition> {
    return this.prisma.leaseStateTransition.create({
      data: { organizationId, fromStatusId, toStatusId },
    });
  }
  findAllowedTransition(
    organizationId: string,
    fromStatusId: string,
    toStatusId: string,
  ): Promise<LeaseStateTransition | null> {
    return this.prisma.leaseStateTransition.findUnique({
      where: {
        organizationId_fromStatusId_toStatusId: { organizationId, fromStatusId, toStatusId },
      },
    });
  }
  listTransitionsFrom(
    organizationId: string,
    fromStatusId: string,
  ): Promise<Array<LeaseStateTransition & { toStatus: LeaseStatus }>> {
    return this.prisma.leaseStateTransition.findMany({
      where: { organizationId, fromStatusId },
      include: { toStatus: true },
    }) as unknown as Promise<Array<LeaseStateTransition & { toStatus: LeaseStatus }>>;
  }

  listOrganizationIds(): Promise<Array<{ id: string }>> {
    return this.prisma.organization.findMany({
      where: { deletedAt: null },
      select: { id: true },
    }) as Promise<Array<{ id: string }>>;
  }
}
