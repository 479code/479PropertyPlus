import { Injectable } from '@nestjs/common';
import { type NotificationSettings, type NotificationTemplate } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { type CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { type UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { type UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';

@Injectable()
export class NotificationSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOrg(organizationId: string): Promise<NotificationSettings | null> {
    return this.prisma.notificationSettings.findUnique({ where: { organizationId } });
  }

  upsertSettings(
    organizationId: string,
    data: UpdateNotificationSettingsDto,
    actorId?: string,
  ): Promise<NotificationSettings> {
    return this.prisma.notificationSettings.upsert({
      where: { organizationId },
      create: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
      update: { ...data, updatedBy: actorId },
    });
  }

  createTemplate(
    organizationId: string,
    data: CreateNotificationTemplateDto,
    actorId?: string,
  ): Promise<NotificationTemplate> {
    return this.prisma.notificationTemplate.create({
      data: { organizationId, ...data, createdBy: actorId },
    });
  }

  findTemplateById(organizationId: string, id: string): Promise<NotificationTemplate | null> {
    return this.prisma.notificationTemplate.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  findTemplateByKey(
    organizationId: string,
    event: CreateNotificationTemplateDto['event'],
    channel: CreateNotificationTemplateDto['channel'],
  ): Promise<NotificationTemplate | null> {
    return this.prisma.notificationTemplate.findFirst({
      where: { organizationId, event, channel, deletedAt: null },
    });
  }

  findTemplates(organizationId: string): Promise<NotificationTemplate[]> {
    return this.prisma.notificationTemplate.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ event: 'asc' }, { channel: 'asc' }],
    });
  }

  updateTemplate(
    id: string,
    data: UpdateNotificationTemplateDto & { updatedBy?: string },
  ): Promise<NotificationTemplate> {
    return this.prisma.notificationTemplate.update({ where: { id }, data });
  }

  softDeleteTemplate(id: string, updatedBy?: string): Promise<NotificationTemplate> {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy },
    });
  }
}
