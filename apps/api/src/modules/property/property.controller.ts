import { type Paginated } from '@479property/types';
import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Property } from '@prisma/client';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { OrgId } from '../../common/tenant/tenant.decorators';

import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { type PropertyDashboard, PropertyService } from './property.service';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertyController {
  constructor(private readonly service: PropertyService) {}

  @Post()
  @RequirePermissions('property:create')
  @ApiOperation({ summary: 'Create a property (auto-generates code + slug)' })
  create(
    @OrgId() orgId: string,
    @Body() dto: CreatePropertyDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<Property> {
    return this.service.create(orgId, dto, actorId);
  }

  @Get()
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'Search properties with filters, sorting, and pagination' })
  search(@OrgId() orgId: string, @Query() query: SearchPropertyDto): Promise<Paginated<Property>> {
    return this.service.search(orgId, query);
  }

  @Get('dashboard')
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'Portfolio summary: counts, value, occupancy' })
  dashboard(@OrgId() orgId: string): Promise<PropertyDashboard> {
    return this.service.dashboard(orgId);
  }

  @Get(':id')
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'Get a property by id' })
  get(@OrgId() orgId: string, @Param('id') id: string): Promise<Property> {
    return this.service.get(orgId, id, true);
  }

  @Patch(':id')
  @RequirePermissions('property:update')
  @ApiOperation({ summary: 'Update a property' })
  update(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<Property> {
    return this.service.update(orgId, id, dto, actorId);
  }

  @Post(':id/archive')
  @HttpCode(204)
  @RequirePermissions('property:archive')
  @ApiOperation({ summary: 'Archive (soft-delete) a property' })
  async archive(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.service.archive(orgId, id, actorId);
  }

  @Post(':id/restore')
  @RequirePermissions('property:restore')
  @ApiOperation({ summary: 'Restore an archived property' })
  restore(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<Property> {
    return this.service.restore(orgId, id, actorId);
  }
}
