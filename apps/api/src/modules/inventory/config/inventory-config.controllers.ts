import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  type BuildingStatus,
  type UnitFeature,
  type UnitStatus,
  type UnitType,
} from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import {
  CreateBuildingStatusDto,
  CreateUnitFeatureDto,
  CreateUnitStatusDto,
  CreateUnitTypeDto,
  UpdateBuildingStatusDto,
  UpdateUnitFeatureDto,
  UpdateUnitStatusDto,
  UpdateUnitTypeDto,
} from './dto/inventory-config.dto';
import { InventoryConfigService } from './inventory-config.service';

@ApiTags('Building Statuses')
@ApiBearerAuth()
@Controller('building-statuses')
export class BuildingStatusController {
  constructor(private readonly service: InventoryConfigService) {}
  @Get() @RequirePermissions('building:read') list(@OrgId() o: string): Promise<BuildingStatus[]> {
    return this.service.listBuildingStatuses(o);
  }
  @Post() @RequirePermissions('building_status:manage') create(
    @OrgId() o: string,
    @Body() dto: CreateBuildingStatusDto,
    @CurrentUser('userId') a: string,
  ): Promise<BuildingStatus> {
    return this.service.createBuildingStatus(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('building_status:manage') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateBuildingStatusDto,
    @CurrentUser('userId') a: string,
  ): Promise<BuildingStatus> {
    return this.service.updateBuildingStatus(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('building_status:manage') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeBuildingStatus(o, id, a);
  }
}

@ApiTags('Unit Types')
@ApiBearerAuth()
@Controller('unit-types')
export class UnitTypeController {
  constructor(private readonly service: InventoryConfigService) {}
  @Get() @RequirePermissions('unit:read') list(@OrgId() o: string): Promise<UnitType[]> {
    return this.service.listUnitTypes(o);
  }
  @Post() @RequirePermissions('unit_type:manage') create(
    @OrgId() o: string,
    @Body() dto: CreateUnitTypeDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitType> {
    return this.service.createUnitType(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('unit_type:manage') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateUnitTypeDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitType> {
    return this.service.updateUnitType(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('unit_type:manage') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeUnitType(o, id, a);
  }
}

@ApiTags('Unit Statuses')
@ApiBearerAuth()
@Controller('unit-statuses')
export class UnitStatusController {
  constructor(private readonly service: InventoryConfigService) {}
  @Get() @RequirePermissions('unit:read') list(@OrgId() o: string): Promise<UnitStatus[]> {
    return this.service.listUnitStatuses(o);
  }
  @Post() @RequirePermissions('unit_status:manage') create(
    @OrgId() o: string,
    @Body() dto: CreateUnitStatusDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitStatus> {
    return this.service.createUnitStatus(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('unit_status:manage') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateUnitStatusDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitStatus> {
    return this.service.updateUnitStatus(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('unit_status:manage') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeUnitStatus(o, id, a);
  }
}

@ApiTags('Unit Features')
@ApiBearerAuth()
@Controller('unit-features')
export class UnitFeatureController {
  constructor(private readonly service: InventoryConfigService) {}
  @Get() @RequirePermissions('unit:read') list(@OrgId() o: string): Promise<UnitFeature[]> {
    return this.service.listUnitFeatures(o);
  }
  @Post() @RequirePermissions('unit_feature:manage') create(
    @OrgId() o: string,
    @Body() dto: CreateUnitFeatureDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitFeature> {
    return this.service.createUnitFeature(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('unit_feature:manage') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateUnitFeatureDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitFeature> {
    return this.service.updateUnitFeature(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('unit_feature:manage') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeUnitFeature(o, id, a);
  }
}
