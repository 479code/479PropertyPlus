import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type LeaseDocument } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateLeaseDocumentDto, UpdateLeaseDocumentDto } from './dto/lease-document.dto';
import { LeaseDocumentService } from './lease-document.service';

@ApiTags('Lease Documents')
@ApiBearerAuth()
@Controller('leases/:leaseId/documents')
export class LeaseDocumentController {
  constructor(private readonly service: LeaseDocumentService) {}

  @Get() @RequirePermissions('lease:read') list(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
  ): Promise<LeaseDocument[]> {
    return this.service.list(o, leaseId);
  }

  @Post() @RequirePermissions('lease_document:create') create(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Body() dto: CreateLeaseDocumentDto,
    @CurrentUser('userId') a: string,
  ): Promise<LeaseDocument> {
    return this.service.create(o, leaseId, dto, a);
  }

  @Patch(':id') @RequirePermissions('lease_document:update') update(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaseDocumentDto,
    @CurrentUser('userId') a: string,
  ): Promise<LeaseDocument> {
    return this.service.update(o, leaseId, id, dto, a);
  }

  @Delete(':id') @HttpCode(204) @RequirePermissions('lease_document:update') async remove(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.remove(o, leaseId, id, a);
  }
}
