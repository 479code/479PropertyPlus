import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type NotificationSettings, type NotificationTemplate } from '@prisma/client';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { ActorId, OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import { NotificationSettingsService } from './notification-settings.service';

@ApiTags('Notification Settings')
@Controller('config/notification-settings')
@ApiBearerAuth()
@RequirePermissions('configuration:read')
export class NotificationSettingsController {
  constructor(private readonly service: NotificationSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification channel settings' })
  get(@OrgId() organizationId: string, @ActorId() actorId?: string): Promise<NotificationSettings> {
    return this.service.getSettings(organizationId, actorId);
  }

  @RequirePermissions('configuration:update')
  @Put()
  @ApiOperation({ summary: 'Update notification channel settings' })
  update(
    @OrgId() organizationId: string,
    @Body() dto: UpdateNotificationSettingsDto,
    @ActorId() actorId?: string,
  ): Promise<NotificationSettings> {
    return this.service.updateSettings(organizationId, dto, actorId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List notification templates' })
  listTemplates(@OrgId() organizationId: string): Promise<NotificationTemplate[]> {
    return this.service.listTemplates(organizationId);
  }

  @RequirePermissions('configuration:create')
  @Post('templates')
  @ApiOperation({ summary: 'Create a notification template' })
  createTemplate(
    @OrgId() organizationId: string,
    @Body() dto: CreateNotificationTemplateDto,
    @ActorId() actorId?: string,
  ): Promise<NotificationTemplate> {
    return this.service.createTemplate(organizationId, dto, actorId);
  }

  @RequirePermissions('configuration:update')
  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update a notification template' })
  updateTemplate(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto,
    @ActorId() actorId?: string,
  ): Promise<NotificationTemplate> {
    return this.service.updateTemplate(organizationId, id, dto, actorId);
  }

  @RequirePermissions('configuration:delete')
  @Delete('templates/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a notification template' })
  async removeTemplate(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @ActorId() actorId?: string,
  ): Promise<void> {
    await this.service.removeTemplate(organizationId, id, actorId);
  }
}
