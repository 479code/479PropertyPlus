import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  type PropertyFeature,
  type PropertyStatus,
  type PropertyTag,
  type PropertyType,
} from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import {
  CreatePropertyFeatureDto,
  CreatePropertyStatusDto,
  CreatePropertyTagDto,
  CreatePropertyTypeDto,
  UpdatePropertyFeatureDto,
  UpdatePropertyStatusDto,
  UpdatePropertyTagDto,
  UpdatePropertyTypeDto,
} from './dto/property-config.dto';
import { PropertyConfigService } from './property-config.service';

@ApiTags('Property Types')
@ApiBearerAuth()
@Controller('property-types')
export class PropertyTypeController {
  constructor(private readonly service: PropertyConfigService) {}

  @Get()
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'List property types' })
  list(@OrgId() orgId: string): Promise<PropertyType[]> {
    return this.service.listTypes(orgId);
  }
  @Post()
  @RequirePermissions('property_type:manage')
  @ApiOperation({ summary: 'Create a property type' })
  create(
    @OrgId() orgId: string,
    @Body() dto: CreatePropertyTypeDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyType> {
    return this.service.createType(orgId, dto, actorId);
  }
  @Patch(':id')
  @RequirePermissions('property_type:manage')
  @ApiOperation({ summary: 'Update a property type' })
  update(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyTypeDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyType> {
    return this.service.updateType(orgId, id, dto, actorId);
  }
  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('property_type:manage')
  @ApiOperation({ summary: 'Delete a property type' })
  async remove(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.service.removeType(orgId, id, actorId);
  }
}

@ApiTags('Property Statuses')
@ApiBearerAuth()
@Controller('property-statuses')
export class PropertyStatusController {
  constructor(private readonly service: PropertyConfigService) {}

  @Get()
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'List property statuses' })
  list(@OrgId() orgId: string): Promise<PropertyStatus[]> {
    return this.service.listStatuses(orgId);
  }
  @Post()
  @RequirePermissions('property_status:manage')
  @ApiOperation({ summary: 'Create a property status' })
  create(
    @OrgId() orgId: string,
    @Body() dto: CreatePropertyStatusDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyStatus> {
    return this.service.createStatus(orgId, dto, actorId);
  }
  @Patch(':id')
  @RequirePermissions('property_status:manage')
  @ApiOperation({ summary: 'Update a property status' })
  update(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyStatusDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyStatus> {
    return this.service.updateStatus(orgId, id, dto, actorId);
  }
  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('property_status:manage')
  @ApiOperation({ summary: 'Delete a property status' })
  async remove(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.service.removeStatus(orgId, id, actorId);
  }
}

@ApiTags('Property Features')
@ApiBearerAuth()
@Controller('property-features')
export class PropertyFeatureController {
  constructor(private readonly service: PropertyConfigService) {}

  @Get()
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'List property features' })
  list(@OrgId() orgId: string): Promise<PropertyFeature[]> {
    return this.service.listFeatures(orgId);
  }
  @Post()
  @RequirePermissions('property_feature:manage')
  @ApiOperation({ summary: 'Create a property feature' })
  create(
    @OrgId() orgId: string,
    @Body() dto: CreatePropertyFeatureDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyFeature> {
    return this.service.createFeature(orgId, dto, actorId);
  }
  @Patch(':id')
  @RequirePermissions('property_feature:manage')
  @ApiOperation({ summary: 'Update a property feature' })
  update(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyFeatureDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyFeature> {
    return this.service.updateFeature(orgId, id, dto, actorId);
  }
  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('property_feature:manage')
  @ApiOperation({ summary: 'Delete a property feature' })
  async remove(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.service.removeFeature(orgId, id, actorId);
  }
}

@ApiTags('Property Tags')
@ApiBearerAuth()
@Controller('property-tags')
export class PropertyTagController {
  constructor(private readonly service: PropertyConfigService) {}

  @Get()
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'List property tags' })
  list(@OrgId() orgId: string): Promise<PropertyTag[]> {
    return this.service.listTags(orgId);
  }
  @Post()
  @RequirePermissions('property_tag:manage')
  @ApiOperation({ summary: 'Create a property tag' })
  create(
    @OrgId() orgId: string,
    @Body() dto: CreatePropertyTagDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyTag> {
    return this.service.createTag(orgId, dto, actorId);
  }
  @Patch(':id')
  @RequirePermissions('property_tag:manage')
  @ApiOperation({ summary: 'Update a property tag' })
  update(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyTagDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyTag> {
    return this.service.updateTag(orgId, id, dto, actorId);
  }
  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('property_tag:manage')
  @ApiOperation({ summary: 'Delete a property tag' })
  async remove(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.service.removeTag(orgId, id, actorId);
  }
}
