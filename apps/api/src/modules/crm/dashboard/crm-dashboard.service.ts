import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

export interface CrmDashboardSummary {
  totalTenants: number;
  corporateTenants: number;
  individualTenants: number;
  owners: number;
  agents: number;
  inactiveContacts: number;
  recentRegistrations: number;
  upcomingIdExpiry: number;
}

const RECENT_REGISTRATION_WINDOW_DAYS = 30;
const ID_EXPIRY_LOOKAHEAD_DAYS = 30;

@Injectable()
export class CrmDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(organizationId: string): Promise<CrmDashboardSummary> {
    const now = new Date();
    const recentSince = new Date(
      now.getTime() - RECENT_REGISTRATION_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const expiryUntil = new Date(now.getTime() + ID_EXPIRY_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

    const [
      totalTenants,
      corporateTenants,
      owners,
      agents,
      inactiveContacts,
      recentRegistrations,
      upcomingIdExpiry,
    ] = await Promise.all([
      this.prisma.tenantProfile.count({
        where: { deletedAt: null, person: { organizationId, deletedAt: null } },
      }),
      this.prisma.tenantProfile.count({
        where: {
          deletedAt: null,
          companyId: { not: null },
          person: { organizationId, deletedAt: null },
        },
      }),
      this.prisma.ownerProfile.count({
        where: { deletedAt: null, person: { organizationId, deletedAt: null } },
      }),
      this.prisma.agentProfile.count({
        where: { deletedAt: null, person: { organizationId, deletedAt: null } },
      }),
      this.prisma.person.count({ where: { organizationId, deletedAt: null, isActive: false } }),
      this.prisma.person.count({
        where: { organizationId, deletedAt: null, createdAt: { gte: recentSince } },
      }),
      this.prisma.person.count({
        where: {
          organizationId,
          deletedAt: null,
          identificationExpiry: { gte: now, lte: expiryUntil },
        },
      }),
    ]);

    return {
      totalTenants,
      corporateTenants,
      individualTenants: totalTenants - corporateTenants,
      owners,
      agents,
      inactiveContacts,
      recentRegistrations,
      upcomingIdExpiry,
    };
  }
}
