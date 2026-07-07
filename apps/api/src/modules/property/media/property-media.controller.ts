import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type PropertyDocument, type PropertyImage } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';
import { CreatePropertyDocumentDto, UpdatePropertyDocumentDto } from '../dto/property-document.dto';
import { CreatePropertyImageDto, UpdatePropertyImageDto } from '../dto/property-image.dto';

import { PropertyMediaService } from './property-media.service';

@ApiTags('Property Images')
@ApiBearerAuth()
@Controller('properties/:propertyId/images')
export class PropertyImageController {
  constructor(private readonly media: PropertyMediaService) {}

  @Get()
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'List property images' })
  list(@OrgId() orgId: string, @Param('propertyId') propertyId: string): Promise<PropertyImage[]> {
    return this.media.listImages(orgId, propertyId);
  }

  @Post()
  @RequirePermissions('property_image:create')
  @ApiOperation({ summary: 'Add a property image' })
  add(
    @OrgId() orgId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreatePropertyImageDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyImage> {
    return this.media.addImage(orgId, propertyId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('property_image:update')
  @ApiOperation({ summary: 'Update a property image' })
  update(
    @OrgId() orgId: string,
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyImageDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyImage> {
    return this.media.updateImage(orgId, propertyId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('property_image:delete')
  @ApiOperation({ summary: 'Remove a property image' })
  async remove(
    @OrgId() orgId: string,
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.media.removeImage(orgId, propertyId, id, actorId);
  }
}

@ApiTags('Property Documents')
@ApiBearerAuth()
@Controller('properties/:propertyId/documents')
export class PropertyDocumentController {
  constructor(private readonly media: PropertyMediaService) {}

  @Get()
  @RequirePermissions('property:read')
  @ApiOperation({ summary: 'List property documents' })
  list(
    @OrgId() orgId: string,
    @Param('propertyId') propertyId: string,
  ): Promise<PropertyDocument[]> {
    return this.media.listDocuments(orgId, propertyId);
  }

  @Post()
  @RequirePermissions('property_document:create')
  @ApiOperation({ summary: 'Add a property document' })
  add(
    @OrgId() orgId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreatePropertyDocumentDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyDocument> {
    return this.media.addDocument(orgId, propertyId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('property_document:update')
  @ApiOperation({ summary: 'Update a property document' })
  update(
    @OrgId() orgId: string,
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDocumentDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<PropertyDocument> {
    return this.media.updateDocument(orgId, propertyId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('property_document:delete')
  @ApiOperation({ summary: 'Remove a property document' })
  async remove(
    @OrgId() orgId: string,
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.media.removeDocument(orgId, propertyId, id, actorId);
  }
}
