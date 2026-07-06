import { Injectable } from '@nestjs/common';
import { type OrganizationSettings } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { OrganizationService } from '../../organization/organization.service';

import { type UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { OrganizationSettingsRepository } from './organization-settings.repository';

@Injectable()
export class OrganizationSettingsService {
  constructor(
    private readonly repository: OrganizationSettingsRepository,
    private readonly organizations: OrganizationService,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, actorId?: string): Promise<OrganizationSettings> {
    await this.organizations.getOrThrow(organizationId);
    const existing = await this.repository.findByOrg(organizationId);
    return existing ?? this.repository.upsert(organizationId, {}, actorId);
  }

  async update(
    organizationId: string,
    dto: UpdateOrganizationSettingsDto,
    actorId?: string,
  ): Promise<OrganizationSettings> {
    await this.organizations.getOrThrow(organizationId);
    const settings = await this.repository.upsert(organizationId, { ...dto }, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'OrganizationSettings',
      entityId: settings.id,
      changes: { ...dto },
    });
    return settings;
  }
}
