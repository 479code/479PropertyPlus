import { type Paginated } from '@479property/types';
import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Building } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';
import {
  InventorySummaryService,
  type BuildingSummary,
} from '../summary/inventory-summary.service';

import { BuildingService } from './building.service';
import { CreateBuildingDto, ListBuildingQueryDto, UpdateBuildingDto } from './dto/building.dto';

@ApiTags('Buildings')
@ApiBearerAuth()
@Controller('buildings')
export class BuildingController {
  constructor(
    private readonly service: BuildingService,
    private readonly summary: InventorySummaryService,
  ) {}

  @Post()
  @RequirePermissions('building:create')
  @ApiOperation({ summary: 'Create a building' })
  create(
    @OrgId() o: string,
    @Body() dto: CreateBuildingDto,
    @CurrentUser('userId') a: string,
  ): Promise<Building> {
    return this.service.create(o, dto, a);
  }

  @Get()
  @RequirePermissions('building:read')
  @ApiOperation({ summary: 'List buildings' })
  list(@OrgId() o: string, @Query() q: ListBuildingQueryDto): Promise<Paginated<Building>> {
    return this.service.list(o, q);
  }

  @Get(':id')
  @RequirePermissions('building:read')
  @ApiOperation({ summary: 'Get a building' })
  get(@OrgId() o: string, @Param('id') id: string): Promise<Building> {
    return this.service.get(o, id, true);
  }

  @Get(':id/summary')
  @RequirePermissions('building:read')
  @ApiOperation({ summary: 'Building dashboard summary' })
  summaryFor(@OrgId() o: string, @Param('id') id: string): Promise<BuildingSummary> {
    return this.summary.buildingSummary(o, id);
  }

  @Patch(':id')
  @RequirePermissions('building:update')
  @ApiOperation({ summary: 'Update a building' })
  update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateBuildingDto,
    @CurrentUser('userId') a: string,
  ): Promise<Building> {
    return this.service.update(o, id, dto, a);
  }

  @Post(':id/archive')
  @HttpCode(204)
  @RequirePermissions('building:archive')
  @ApiOperation({ summary: 'Archive a building' })
  async archive(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.archive(o, id, a);
  }

  @Post(':id/restore')
  @RequirePermissions('building:restore')
  @ApiOperation({ summary: 'Restore a building' })
  restore(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Building> {
    return this.service.restore(o, id, a);
  }
}
