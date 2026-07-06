import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type NotificationSettings, type NotificationTemplate } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { OrganizationService } from '../../organization/organization.service';

import { type CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { type UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { type UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import { NotificationSettingsRepository } from './notification-settings.repository';

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly repository: NotificationSettingsRepository,
    private readonly organizations: OrganizationService,
    private readonly audit: AuditService,
  ) {}

  async getSettings(organizationId: string, actorId?: string): Promise<NotificationSettings> {
    await this.organizations.getOrThrow(organizationId);
    const existing = await this.repository.findByOrg(organizationId);
    return existing ?? this.repository.upsertSettings(organizationId, {}, actorId);
  }

  async updateSettings(
    organizationId: string,
    dto: UpdateNotificationSettingsDto,
    actorId?: string,
  ): Promise<NotificationSettings> {
    await this.organizations.getOrThrow(organizationId);
    const settings = await this.repository.upsertSettings(organizationId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'NotificationSettings',
      entityId: settings.id,
      changes: { ...dto },
    });
    return settings;
  }

  listTemplates(organizationId: string): Promise<NotificationTemplate[]> {
    return this.repository.findTemplates(organizationId);
  }

  async createTemplate(
    organizationId: string,
    dto: CreateNotificationTemplateDto,
    actorId?: string,
  ): Promise<NotificationTemplate> {
    const existing = await this.repository.findTemplateByKey(
      organizationId,
      dto.event,
      dto.channel,
    );
    if (existing) {
      throw new ConflictException(`A template for ${dto.event} / ${dto.channel} already exists`);
    }
    const template = await this.repository.createTemplate(organizationId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'NotificationTemplate',
      entityId: template.id,
      description: `Template ${dto.event}/${dto.channel} created`,
    });
    return template;
  }

  private async getTemplateOrThrow(
    organizationId: string,
    id: string,
  ): Promise<NotificationTemplate> {
    const template = await this.repository.findTemplateById(organizationId, id);
    if (!template) throw new NotFoundException(`Notification template ${id} not found`);
    return template;
  }

  async updateTemplate(
    organizationId: string,
    id: string,
    dto: UpdateNotificationTemplateDto,
    actorId?: string,
  ): Promise<NotificationTemplate> {
    await this.getTemplateOrThrow(organizationId, id);
    const template = await this.repository.updateTemplate(id, { ...dto, updatedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'NotificationTemplate',
      entityId: id,
      changes: { ...dto },
    });
    return template;
  }

  async removeTemplate(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.getTemplateOrThrow(organizationId, id);
    await this.repository.softDeleteTemplate(id, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'NotificationTemplate',
      entityId: id,
    });
  }
}
