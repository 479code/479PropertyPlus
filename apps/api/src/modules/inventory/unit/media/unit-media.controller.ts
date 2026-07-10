import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type UnitDocument, type UnitImage } from '@prisma/client';

import { CurrentUser } from '../../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../../common/tenant/tenant.decorators';
import {
  CreateUnitDocumentDto,
  UpdateUnitDocumentDto,
  CreateUnitImageDto,
  UpdateUnitImageDto,
} from '../dto/unit-media.dto';

import { UnitMediaService } from './unit-media.service';

@ApiTags('Unit Images')
@ApiBearerAuth()
@Controller('units/:unitId/images')
export class UnitImageController {
  constructor(private readonly media: UnitMediaService) {}
  @Get() @RequirePermissions('unit:read') list(
    @OrgId() o: string,
    @Param('unitId') u: string,
  ): Promise<UnitImage[]> {
    return this.media.listImages(o, u);
  }
  @Post() @RequirePermissions('unit_image:create') add(
    @OrgId() o: string,
    @Param('unitId') u: string,
    @Body() dto: CreateUnitImageDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitImage> {
    return this.media.addImage(o, u, dto, a);
  }
  @Patch(':id') @RequirePermissions('unit_image:update') update(
    @OrgId() o: string,
    @Param('unitId') u: string,
    @Param('id') id: string,
    @Body() dto: UpdateUnitImageDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitImage> {
    return this.media.updateImage(o, u, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('unit_image:delete') async remove(
    @OrgId() o: string,
    @Param('unitId') u: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.media.removeImage(o, u, id, a);
  }
}

@ApiTags('Unit Documents')
@ApiBearerAuth()
@Controller('units/:unitId/documents')
export class UnitDocumentController {
  constructor(private readonly media: UnitMediaService) {}
  @Get() @RequirePermissions('unit:read') list(
    @OrgId() o: string,
    @Param('unitId') u: string,
  ): Promise<UnitDocument[]> {
    return this.media.listDocuments(o, u);
  }
  @Post() @RequirePermissions('unit_document:create') add(
    @OrgId() o: string,
    @Param('unitId') u: string,
    @Body() dto: CreateUnitDocumentDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitDocument> {
    return this.media.addDocument(o, u, dto, a);
  }
  @Patch(':id') @RequirePermissions('unit_document:update') update(
    @OrgId() o: string,
    @Param('unitId') u: string,
    @Param('id') id: string,
    @Body() dto: UpdateUnitDocumentDto,
    @CurrentUser('userId') a: string,
  ): Promise<UnitDocument> {
    return this.media.updateDocument(o, u, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('unit_document:delete') async remove(
    @OrgId() o: string,
    @Param('unitId') u: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.media.removeDocument(o, u, id, a);
  }
}
