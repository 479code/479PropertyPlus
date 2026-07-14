import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { LeaseConfigRepository } from '../config/lease-config.repository';

export interface LeaseDashboardSummary {
  totalLeases: number;
  activeLeases: number;
  pendingApproval: number;
  awaitingSignature: number;
  expiringIn30Days: number;
  expired: number;
  terminated: number;
  averageLeaseDurationMonths: number | null;
  occupancyRate: number;
  monthlyRentalValue: number;
  annualContractValue: number;
  upcomingRenewals: number;
  upcomingMoveIns: number;
  upcomingMoveOuts: number;
}

const UPCOMING_WINDOW_DAYS = 30;

@Injectable()
export class LeaseDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configRepository: LeaseConfigRepository,
  ) {}

  async getSummary(organizationId: string): Promise<LeaseDashboardSummary> {
    const statuses = await this.configRepository.listLeaseStatuses(organizationId);
    const idOf = (key: string) => statuses.find((s) => s.key === key)?.id;
    const activeId = idOf('ACTIVE');
    const renewalPendingId = idOf('RENEWAL_PENDING');
    const pendingApprovalId = idOf('PENDING_APPROVAL');
    const awaitingSignatureId = idOf('AWAITING_SIGNATURE');
    const expiredId = idOf('EXPIRED');
    const terminatedId = idOf('TERMINATED');
    const occupancyStatusIds = statuses.filter((s) => s.countsAsOccupancy).map((s) => s.id);

    const now = new Date();
    const in30 = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const [
      totalLeases,
      activeLeases,
      renewalPendingLeases,
      pendingApproval,
      awaitingSignature,
      expiringIn30Days,
      expired,
      terminated,
      upcomingRenewals,
      upcomingMoveIns,
      upcomingMoveOuts,
      totalUnits,
      occupiedUnits,
      rentAggregate,
    ] = await Promise.all([
      this.prisma.lease.count({ where: { organizationId, deletedAt: null } }),
      activeId
        ? this.prisma.lease.count({
            where: { organizationId, deletedAt: null, leaseStatusId: activeId },
          })
        : 0,
      renewalPendingId
        ? this.prisma.lease.count({
            where: { organizationId, deletedAt: null, leaseStatusId: renewalPendingId },
          })
        : 0,
      pendingApprovalId
        ? this.prisma.lease.count({
            where: { organizationId, deletedAt: null, leaseStatusId: pendingApprovalId },
          })
        : 0,
      awaitingSignatureId
        ? this.prisma.lease.count({
            where: { organizationId, deletedAt: null, leaseStatusId: awaitingSignatureId },
          })
        : 0,
      occupancyStatusIds.length
        ? this.prisma.lease.count({
            where: {
              organizationId,
              deletedAt: null,
              leaseStatusId: { in: occupancyStatusIds },
              leaseEndDate: { gte: now, lte: in30 },
            },
          })
        : 0,
      expiredId
        ? this.prisma.lease.count({
            where: { organizationId, deletedAt: null, leaseStatusId: expiredId },
          })
        : 0,
      terminatedId
        ? this.prisma.lease.count({
            where: { organizationId, deletedAt: null, leaseStatusId: terminatedId },
          })
        : 0,
      renewalPendingId
        ? this.prisma.lease.count({
            where: { organizationId, deletedAt: null, leaseStatusId: renewalPendingId },
          })
        : 0,
      occupancyStatusIds.length
        ? this.prisma.lease.count({
            where: {
              organizationId,
              deletedAt: null,
              leaseStatusId: { in: occupancyStatusIds },
              moveInDate: { gte: now, lte: in30 },
            },
          })
        : 0,
      occupancyStatusIds.length
        ? this.prisma.lease.count({
            where: {
              organizationId,
              deletedAt: null,
              leaseStatusId: { in: occupancyStatusIds },
              moveOutDate: { gte: now, lte: in30 },
            },
          })
        : 0,
      this.prisma.unit.count({ where: { organizationId, deletedAt: null } }),
      this.prisma.unit.count({
        where: { organizationId, deletedAt: null, availability: 'OCCUPIED' },
      }),
      occupancyStatusIds.length
        ? this.prisma.lease.aggregate({
            where: { organizationId, deletedAt: null, leaseStatusId: { in: occupancyStatusIds } },
            _sum: { monthlyRent: true, annualRent: true },
            _avg: { leaseDurationMonths: true },
          })
        : null,
    ]);

    const monthlyRentalValue = Number(rentAggregate?._sum?.monthlyRent ?? 0);
    const annualContractValue = Number(rentAggregate?._sum?.annualRent ?? 0);
    const averageLeaseDurationMonths = rentAggregate?._avg?.leaseDurationMonths ?? null;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0;

    return {
      totalLeases,
      activeLeases: activeLeases + renewalPendingLeases,
      pendingApproval,
      awaitingSignature,
      expiringIn30Days,
      expired,
      terminated,
      averageLeaseDurationMonths:
        averageLeaseDurationMonths === null
          ? null
          : Math.round(averageLeaseDurationMonths * 10) / 10,
      occupancyRate,
      monthlyRentalValue,
      annualContractValue,
      upcomingRenewals,
      upcomingMoveIns,
      upcomingMoveOuts,
    };
  }
}
