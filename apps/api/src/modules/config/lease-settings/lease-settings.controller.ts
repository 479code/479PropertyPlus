import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type LateFeeRule, type LeaseSettings } from '@prisma/client';

import { ActorId, OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateLateFeeRuleDto } from './dto/create-late-fee-rule.dto';
import { UpdateLateFeeRuleDto } from './dto/update-late-fee-rule.dto';
import { UpdateLeaseSettingsDto } from './dto/update-lease-settings.dto';
import { LeaseSettingsService } from './lease-settings.service';

@ApiTags('Lease Settings')
@Controller('config/lease-settings')
export class LeaseSettingsController {
  constructor(private readonly service: LeaseSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get lease settings' })
  get(@OrgId() organizationId: string, @ActorId() actorId?: string): Promise<LeaseSettings> {
    return this.service.get(organizationId, actorId);
  }

  @Put()
  @ApiOperation({ summary: 'Update lease settings' })
  update(
    @OrgId() organizationId: string,
    @Body() dto: UpdateLeaseSettingsDto,
    @ActorId() actorId?: string,
  ): Promise<LeaseSettings> {
    return this.service.update(organizationId, dto, actorId);
  }

  @Get('late-fee-rules')
  @ApiOperation({ summary: 'List late fee rules' })
  listRules(@OrgId() organizationId: string): Promise<LateFeeRule[]> {
    return this.service.listLateFeeRules(organizationId);
  }

  @Post('late-fee-rules')
  @ApiOperation({ summary: 'Create a late fee rule' })
  createRule(
    @OrgId() organizationId: string,
    @Body() dto: CreateLateFeeRuleDto,
    @ActorId() actorId?: string,
  ): Promise<LateFeeRule> {
    return this.service.createLateFeeRule(organizationId, dto, actorId);
  }

  @Patch('late-fee-rules/:id')
  @ApiOperation({ summary: 'Update a late fee rule' })
  updateRule(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLateFeeRuleDto,
    @ActorId() actorId?: string,
  ): Promise<LateFeeRule> {
    return this.service.updateLateFeeRule(organizationId, id, dto, actorId);
  }

  @Delete('late-fee-rules/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a late fee rule' })
  async removeRule(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @ActorId() actorId?: string,
  ): Promise<void> {
    await this.service.removeLateFeeRule(organizationId, id, actorId);
  }
}
