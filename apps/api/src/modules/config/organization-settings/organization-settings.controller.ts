import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type OrganizationSettings } from '@prisma/client';

import { ActorId, OrgId } from '../../../common/tenant/tenant.decorators';

import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { OrganizationSettingsService } from './organization-settings.service';

@ApiTags('Organization Settings')
@Controller('config/organization-settings')
export class OrganizationSettingsController {
  constructor(private readonly service: OrganizationSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get organization settings (creates defaults if absent)' })
  get(@OrgId() organizationId: string, @ActorId() actorId?: string): Promise<OrganizationSettings> {
    return this.service.get(organizationId, actorId);
  }

  @Put()
  @ApiOperation({ summary: 'Update organization settings' })
  update(
    @OrgId() organizationId: string,
    @Body() dto: UpdateOrganizationSettingsDto,
    @ActorId() actorId?: string,
  ): Promise<OrganizationSettings> {
    return this.service.update(organizationId, dto, actorId);
  }
}
