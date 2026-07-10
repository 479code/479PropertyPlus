import { type Paginated } from '@479property/types';
import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Unit } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateUnitDto, SearchUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { UnitService } from './unit.service';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitController {
  constructor(private readonly service: UnitService) {}

  @Post()
  @RequirePermissions('unit:create')
  @ApiOperation({ summary: 'Create a unit (auto code + slug + availability)' })
  create(
    @OrgId() o: string,
    @Body() dto: CreateUnitDto,
    @CurrentUser('userId') a: string,
  ): Promise<Unit> {
    return this.service.create(o, dto, a);
  }

  @Get()
  @RequirePermissions('unit:read')
  @ApiOperation({ summary: 'Search units' })
  search(@OrgId() o: string, @Query() q: SearchUnitDto): Promise<Paginated<Unit>> {
    return this.service.search(o, q);
  }

  @Get(':id')
  @RequirePermissions('unit:read')
  @ApiOperation({ summary: 'Get a unit' })
  get(@OrgId() o: string, @Param('id') id: string): Promise<Unit> {
    return this.service.get(o, id, true);
  }

  @Get(':id/timeline')
  @RequirePermissions('unit:read')
  @ApiOperation({ summary: 'Unit activity timeline' })
  timeline(@OrgId() o: string, @Param('id') id: string): Promise<unknown[]> {
    return this.service.timeline(o, id);
  }

  @Get(':id/occupancy-history')
  @RequirePermissions('unit:read')
  @ApiOperation({ summary: 'Unit availability transition history' })
  history(@OrgId() o: string, @Param('id') id: string): Promise<unknown[]> {
    return this.service.occupancyHistory(o, id);
  }

  @Patch(':id')
  @RequirePermissions('unit:update')
  @ApiOperation({ summary: 'Update a unit' })
  update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @CurrentUser('userId') a: string,
  ): Promise<Unit> {
    return this.service.update(o, id, dto, a);
  }

  @Post(':id/archive')
  @HttpCode(204)
  @RequirePermissions('unit:archive')
  @ApiOperation({ summary: 'Archive a unit' })
  async archive(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.archive(o, id, a);
  }

  @Post(':id/restore')
  @RequirePermissions('unit:restore')
  @ApiOperation({ summary: 'Restore a unit' })
  restore(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Unit> {
    return this.service.restore(o, id, a);
  }
}
