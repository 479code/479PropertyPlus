import { type Paginated } from '@479property/types';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Organization } from '@prisma/client';

import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ActorId } from '../../common/tenant/tenant.decorators';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Post()
  @RequirePermissions('organization:create')
  @ApiOperation({ summary: 'Create an organization (tenant)' })
  create(@Body() dto: CreateOrganizationDto, @ActorId() actorId?: string): Promise<Organization> {
    return this.service.create(dto, actorId);
  }

  @Get()
  @RequirePermissions('organization:read')
  @ApiOperation({ summary: 'List organizations' })
  list(@Query() query: PaginationQueryDto): Promise<Paginated<Organization>> {
    return this.service.list(query);
  }

  @Get(':id')
  @RequirePermissions('organization:read')
  @ApiOperation({ summary: 'Get an organization by id' })
  get(@Param('id') id: string): Promise<Organization> {
    return this.service.getOrThrow(id);
  }

  @Patch(':id')
  @RequirePermissions('organization:update')
  @ApiOperation({ summary: 'Update an organization' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @ActorId() actorId?: string,
  ): Promise<Organization> {
    return this.service.update(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('organization:delete')
  @ApiOperation({ summary: 'Soft-delete an organization' })
  async remove(@Param('id') id: string, @ActorId() actorId?: string): Promise<void> {
    await this.service.remove(id, actorId);
  }
}
