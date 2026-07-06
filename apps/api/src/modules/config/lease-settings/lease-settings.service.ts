import { Injectable, NotFoundException } from '@nestjs/common';
import { type LateFeeRule, type LeaseSettings } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { OrganizationService } from '../../organization/organization.service';

import { type CreateLateFeeRuleDto } from './dto/create-late-fee-rule.dto';
import { type UpdateLateFeeRuleDto } from './dto/update-late-fee-rule.dto';
import { type UpdateLeaseSettingsDto } from './dto/update-lease-settings.dto';
import { LateFeeRuleRepository } from './late-fee-rule.repository';
import { LeaseSettingsRepository } from './lease-settings.repository';

@Injectable()
export class LeaseSettingsService {
  constructor(
    private readonly settingsRepo: LeaseSettingsRepository,
    private readonly lateFeeRepo: LateFeeRuleRepository,
    private readonly organizations: OrganizationService,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, actorId?: string): Promise<LeaseSettings> {
    await this.organizations.getOrThrow(organizationId);
    const existing = await this.settingsRepo.findByOrg(organizationId);
    return existing ?? this.settingsRepo.upsert(organizationId, {}, actorId);
  }

  async update(
    organizationId: string,
    dto: UpdateLeaseSettingsDto,
    actorId?: string,
  ): Promise<LeaseSettings> {
    await this.organizations.getOrThrow(organizationId);
    const settings = await this.settingsRepo.upsert(organizationId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'LeaseSettings',
      entityId: settings.id,
      changes: { ...dto },
    });
    return settings;
  }

  // ── Late fee rules ──────────────────────────────────────────────
  listLateFeeRules(organizationId: string): Promise<LateFeeRule[]> {
    return this.lateFeeRepo.findMany(organizationId);
  }

  async createLateFeeRule(
    organizationId: string,
    dto: CreateLateFeeRuleDto,
    actorId?: string,
  ): Promise<LateFeeRule> {
    const rule = await this.lateFeeRepo.create(organizationId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'LateFeeRule',
      entityId: rule.id,
      description: `Late fee rule "${rule.name}" created`,
    });
    return rule;
  }

  private async getLateFeeRuleOrThrow(organizationId: string, id: string): Promise<LateFeeRule> {
    const rule = await this.lateFeeRepo.findById(organizationId, id);
    if (!rule) throw new NotFoundException(`Late fee rule ${id} not found`);
    return rule;
  }

  async updateLateFeeRule(
    organizationId: string,
    id: string,
    dto: UpdateLateFeeRuleDto,
    actorId?: string,
  ): Promise<LateFeeRule> {
    await this.getLateFeeRuleOrThrow(organizationId, id);
    const rule = await this.lateFeeRepo.update(id, { ...dto, updatedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'LateFeeRule',
      entityId: id,
      changes: { ...dto },
    });
    return rule;
  }

  async removeLateFeeRule(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.getLateFeeRuleOrThrow(organizationId, id);
    await this.lateFeeRepo.softDelete(id, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'LateFeeRule',
      entityId: id,
    });
  }
}
