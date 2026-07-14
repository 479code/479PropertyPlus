import { Injectable } from '@nestjs/common';
import {
  type AgentProfile,
  type OwnerProfile,
  type Prisma,
  type TenantProfile,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface TenantProfileData {
  companyId?: string;
  employmentStatus?: string;
  employer?: string;
  monthlyIncome?: number;
  preferredPaymentMethod?: string;
  preferredCommunication?: string;
  riskRating?: string;
  creditScore?: number;
  status?: string;
  defaultGuarantorPersonId?: string;
}

export interface AgentProfileData {
  agencyName?: string;
  commissionRate?: number;
  licenceNumber?: string;
  territory?: string;
  notes?: string;
}

export interface OwnerProfileData {
  ownershipType?: string;
  bankDetails?: Record<string, unknown>;
  payoutPreference?: string;
  notes?: string;
}

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Tenant ──
  findTenantProfile(personId: string): Promise<TenantProfile | null> {
    return this.prisma.tenantProfile.findUnique({
      where: { personId },
      include: { company: true },
    });
  }
  upsertTenantProfile(
    personId: string,
    data: TenantProfileData,
    actorId?: string,
  ): Promise<TenantProfile> {
    return this.prisma.tenantProfile.upsert({
      where: { personId },
      create: { ...data, personId, createdBy: actorId, updatedBy: actorId },
      update: { ...data, updatedBy: actorId },
      include: { company: true },
    });
  }
  deleteTenantProfile(personId: string): Promise<TenantProfile> {
    return this.prisma.tenantProfile.delete({ where: { personId } });
  }

  // ── Agent ──
  findAgentProfile(personId: string): Promise<AgentProfile | null> {
    return this.prisma.agentProfile.findUnique({ where: { personId } });
  }
  upsertAgentProfile(
    personId: string,
    data: AgentProfileData,
    actorId?: string,
  ): Promise<AgentProfile> {
    return this.prisma.agentProfile.upsert({
      where: { personId },
      create: { ...data, personId, createdBy: actorId, updatedBy: actorId },
      update: { ...data, updatedBy: actorId },
    });
  }
  deleteAgentProfile(personId: string): Promise<AgentProfile> {
    return this.prisma.agentProfile.delete({ where: { personId } });
  }

  // ── Owner ──
  findOwnerProfile(personId: string): Promise<OwnerProfile | null> {
    return this.prisma.ownerProfile.findUnique({ where: { personId } });
  }
  upsertOwnerProfile(
    personId: string,
    data: OwnerProfileData,
    actorId?: string,
  ): Promise<OwnerProfile> {
    const bankDetails = data.bankDetails as Prisma.InputJsonValue | undefined;
    return this.prisma.ownerProfile.upsert({
      where: { personId },
      create: { ...data, bankDetails, personId, createdBy: actorId, updatedBy: actorId },
      update: { ...data, bankDetails, updatedBy: actorId },
    });
  }
  deleteOwnerProfile(personId: string): Promise<OwnerProfile> {
    return this.prisma.ownerProfile.delete({ where: { personId } });
  }
}
