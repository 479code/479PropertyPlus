import { type Paginated } from '@479property/types';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { type ConfigurationOption } from '@prisma/client';

import { ActorId, OrgId } from '../../../common/tenant/tenant.decorators';

import { ConfigurationOptionsService } from './configuration-options.service';
import { CreateConfigurationOptionDto } from './dto/create-configuration-option.dto';
import { QueryConfigurationOptionDto } from './dto/query-configuration-option.dto';
import { UpdateConfigurationOptionDto } from './dto/update-configuration-option.dto';

@ApiTags('Configuration Options')
@Controller('config/options')
export class ConfigurationOptionsController {
  constructor(private readonly service: ConfigurationOptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a configuration option' })
  create(
    @OrgId() organizationId: string,
    @Body() dto: CreateConfigurationOptionDto,
    @ActorId() actorId?: string,
  ): Promise<ConfigurationOption> {
    return this.service.create(organizationId, dto, actorId);
  }

  @Get()
  @ApiOperation({ summary: 'List configuration options (optionally by category)' })
  list(
    @OrgId() organizationId: string,
    @Query() query: QueryConfigurationOptionDto,
  ): Promise<Paginated<ConfigurationOption>> {
    return this.service.list(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a configuration option' })
  get(@OrgId() organizationId: string, @Param('id') id: string): Promise<ConfigurationOption> {
    return this.service.getOrThrow(organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a configuration option' })
  update(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateConfigurationOptionDto,
    @ActorId() actorId?: string,
  ): Promise<ConfigurationOption> {
    return this.service.update(organizationId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft-delete a configuration option' })
  async remove(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @ActorId() actorId?: string,
  ): Promise<void> {
    await this.service.remove(organizationId, id, actorId);
  }
}
