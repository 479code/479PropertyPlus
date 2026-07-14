import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { type LeaseStatus, type LeaseType, type PaymentFrequency } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

import {
  DEFAULT_LEASE_STATE_TRANSITIONS,
  DEFAULT_LEASE_STATUSES,
  DEFAULT_LEASE_TYPES,
  DEFAULT_PAYMENT_FREQUENCIES,
} from './default-lease-config';
import { type NamedConfigCreate, LeaseConfigRepository } from './lease-config.repository';

@Injectable()
export class LeaseConfigService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LeaseConfigService.name);

  constructor(
    private readonly repository: LeaseConfigRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.backfillAll();
    } catch (error) {
      this.logger.error('Lease config backfill failed', error as Error);
    }
  }

  // ── Lease types ──
  async createLeaseType(
    organizationId: string,
    input: NamedConfigCreate,
    actorId?: string,
  ): Promise<LeaseType> {
    if (await this.repository.findLeaseTypeByName(organizationId, input.name)) {
      throw new ConflictException(`Lease type "${input.name}" already exists`);
    }
    return this.repository.createLeaseType(organizationId, {
      ...input,
      createdBy: actorId,
      updatedBy: actorId,
    });
  }
  listLeaseTypes(organizationId: string): Promise<LeaseType[]> {
    return this.repository.listLeaseTypes(organizationId);
  }
  async updateLeaseType(
    organizationId: string,
    id: string,
    input: Partial<NamedConfigCreate>,
    actorId?: string,
  ): Promise<LeaseType> {
    if (!(await this.repository.findLeaseTypeById(organizationId, id)))
      throw new NotFoundException(`Lease type ${id} not found`);
    return this.repository.updateLeaseType(id, { ...input, updatedBy: actorId });
  }
  async removeLeaseType(organizationId: string, id: string, actorId?: string): Promise<void> {
    if (!(await this.repository.findLeaseTypeById(organizationId, id)))
      throw new NotFoundException(`Lease type ${id} not found`);
    await this.repository.softDeleteLeaseType(id, actorId);
  }

  // ── Payment frequencies ──
  async createPaymentFrequency(
    organizationId: string,
    input: NamedConfigCreate,
    actorId?: string,
  ): Promise<PaymentFrequency> {
    if (await this.repository.findPaymentFrequencyByName(organizationId, input.name)) {
      throw new ConflictException(`Payment frequency "${input.name}" already exists`);
    }
    return this.repository.createPaymentFrequency(organizationId, {
      ...input,
      createdBy: actorId,
      updatedBy: actorId,
    });
  }
  listPaymentFrequencies(organizationId: string): Promise<PaymentFrequency[]> {
    return this.repository.listPaymentFrequencies(organizationId);
  }
  async updatePaymentFrequency(
    organizationId: string,
    id: string,
    input: Partial<NamedConfigCreate>,
    actorId?: string,
  ): Promise<PaymentFrequency> {
    if (!(await this.repository.findPaymentFrequencyById(organizationId, id))) {
      throw new NotFoundException(`Payment frequency ${id} not found`);
    }
    return this.repository.updatePaymentFrequency(id, { ...input, updatedBy: actorId });
  }
  async removePaymentFrequency(
    organizationId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    if (!(await this.repository.findPaymentFrequencyById(organizationId, id))) {
      throw new NotFoundException(`Payment frequency ${id} not found`);
    }
    await this.repository.softDeletePaymentFrequency(id, actorId);
  }

  // ── Lease statuses (display fields only — key/flags are structural) ──
  listLeaseStatuses(organizationId: string): Promise<LeaseStatus[]> {
    return this.repository.listLeaseStatuses(organizationId);
  }
  async updateLeaseStatus(
    organizationId: string,
    id: string,
    input: Partial<{
      name: string;
      color: string;
      description: string;
      displayOrder: number;
      isActive: boolean;
    }>,
    actorId?: string,
  ): Promise<LeaseStatus> {
    if (!(await this.repository.findLeaseStatusById(organizationId, id))) {
      throw new NotFoundException(`Lease status ${id} not found`);
    }
    const updated = await this.repository.updateLeaseStatus(id, input);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'LeaseStatus',
      entityId: id,
    });
    return updated;
  }

  /** Seeds only categories that are still empty for this org — safe to call repeatedly. */
  async seedDefaults(_db: PrismaDb, organizationId: string, actorId?: string): Promise<void> {
    if ((await this.repository.countLeaseTypes(organizationId)) === 0) {
      for (const name of DEFAULT_LEASE_TYPES) {
        await this.repository.createLeaseType(organizationId, {
          name,
          createdBy: actorId,
          updatedBy: actorId,
        });
      }
    }
    if ((await this.repository.countPaymentFrequencies(organizationId)) === 0) {
      for (const name of DEFAULT_PAYMENT_FREQUENCIES) {
        await this.repository.createPaymentFrequency(organizationId, {
          name,
          createdBy: actorId,
          updatedBy: actorId,
        });
      }
    }
    if ((await this.repository.countLeaseStatuses(organizationId)) === 0) {
      for (const def of DEFAULT_LEASE_STATUSES) {
        await this.repository.createLeaseStatus(organizationId, def);
      }
    }
    if ((await this.repository.countLeaseStateTransitions(organizationId)) === 0) {
      const statuses = await this.repository.listLeaseStatuses(organizationId);
      const idByKey = new Map(statuses.map((s) => [s.key, s.id]));
      for (const [fromKey, toKey] of DEFAULT_LEASE_STATE_TRANSITIONS) {
        const fromId = idByKey.get(fromKey);
        const toId = idByKey.get(toKey);
        if (fromId && toId)
          await this.repository.createLeaseStateTransition(organizationId, fromId, toId);
      }
    }
  }

  async backfillAll(): Promise<void> {
    const orgs = await this.repository.listOrganizationIds();
    for (const org of orgs) {
      await this.seedDefaults(this.prisma, org.id);
    }
    if (orgs.length > 0)
      this.logger.log(`Lease config backfilled for ${orgs.length} organization(s)`);
  }
}
