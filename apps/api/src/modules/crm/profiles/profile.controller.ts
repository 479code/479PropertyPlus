import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type AgentProfile, type OwnerProfile, type TenantProfile } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import {
  PatchAgentProfileDto,
  PatchOwnerProfileDto,
  PatchTenantProfileDto,
  UpsertAgentProfileDto,
  UpsertOwnerProfileDto,
  UpsertTenantProfileDto,
} from './dto/profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('Tenant Profiles')
@ApiBearerAuth()
@Controller('people/:personId/tenant-profile')
export class TenantProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  @RequirePermissions('tenant:read')
  @ApiOperation({ summary: "Get a person's tenant profile" })
  get(@OrgId() o: string, @Param('personId') personId: string): Promise<TenantProfile> {
    return this.service.getTenantProfile(o, personId);
  }

  @Put()
  @RequirePermissions('tenant:create')
  @ApiOperation({ summary: 'Create or replace the tenant profile' })
  upsert(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: UpsertTenantProfileDto,
    @CurrentUser('userId') a: string,
  ): Promise<TenantProfile> {
    return this.service.upsertTenantProfile(o, personId, dto, a);
  }

  @Patch()
  @RequirePermissions('tenant:update')
  @ApiOperation({ summary: 'Partially update the tenant profile' })
  patch(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: PatchTenantProfileDto,
    @CurrentUser('userId') a: string,
  ): Promise<TenantProfile> {
    return this.service.upsertTenantProfile(o, personId, dto, a);
  }

  @Delete()
  @HttpCode(204)
  @RequirePermissions('tenant:delete')
  @ApiOperation({ summary: 'Remove the tenant profile' })
  async remove(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeTenantProfile(o, personId, a);
  }
}

@ApiTags('Agent Profiles')
@ApiBearerAuth()
@Controller('people/:personId/agent-profile')
export class AgentProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  @RequirePermissions('agent:read')
  @ApiOperation({ summary: "Get a person's agent profile" })
  get(@OrgId() o: string, @Param('personId') personId: string): Promise<AgentProfile> {
    return this.service.getAgentProfile(o, personId);
  }

  @Put()
  @RequirePermissions('agent:create')
  @ApiOperation({ summary: 'Create or replace the agent profile' })
  upsert(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: UpsertAgentProfileDto,
    @CurrentUser('userId') a: string,
  ): Promise<AgentProfile> {
    return this.service.upsertAgentProfile(o, personId, dto, a);
  }

  @Patch()
  @RequirePermissions('agent:update')
  @ApiOperation({ summary: 'Partially update the agent profile' })
  patch(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: PatchAgentProfileDto,
    @CurrentUser('userId') a: string,
  ): Promise<AgentProfile> {
    return this.service.upsertAgentProfile(o, personId, dto, a);
  }

  @Delete()
  @HttpCode(204)
  @RequirePermissions('agent:delete')
  @ApiOperation({ summary: 'Remove the agent profile' })
  async remove(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeAgentProfile(o, personId, a);
  }
}

@ApiTags('Owner Profiles')
@ApiBearerAuth()
@Controller('people/:personId/owner-profile')
export class OwnerProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  @RequirePermissions('owner:read')
  @ApiOperation({ summary: "Get a person's owner profile" })
  get(@OrgId() o: string, @Param('personId') personId: string): Promise<OwnerProfile> {
    return this.service.getOwnerProfile(o, personId);
  }

  @Put()
  @RequirePermissions('owner:create')
  @ApiOperation({ summary: 'Create or replace the owner profile' })
  upsert(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: UpsertOwnerProfileDto,
    @CurrentUser('userId') a: string,
  ): Promise<OwnerProfile> {
    return this.service.upsertOwnerProfile(o, personId, dto, a);
  }

  @Patch()
  @RequirePermissions('owner:update')
  @ApiOperation({ summary: 'Partially update the owner profile' })
  patch(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: PatchOwnerProfileDto,
    @CurrentUser('userId') a: string,
  ): Promise<OwnerProfile> {
    return this.service.upsertOwnerProfile(o, personId, dto, a);
  }

  @Delete()
  @HttpCode(204)
  @RequirePermissions('owner:delete')
  @ApiOperation({ summary: 'Remove the owner profile' })
  async remove(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeOwnerProfile(o, personId, a);
  }
}
