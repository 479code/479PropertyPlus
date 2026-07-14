import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type LeaseGuarantor } from '@prisma/client';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { AddLeaseGuarantorDto, UpdateLeaseGuarantorDto } from './dto/lease-guarantor.dto';
import { LeaseGuarantorService } from './lease-guarantor.service';

@ApiTags('Lease Guarantors')
@ApiBearerAuth()
@Controller('leases/:leaseId/guarantors')
export class LeaseGuarantorController {
  constructor(private readonly service: LeaseGuarantorService) {}

  @Get() @RequirePermissions('lease:read') list(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
  ): Promise<LeaseGuarantor[]> {
    return this.service.list(o, leaseId);
  }

  @Post() @RequirePermissions('lease:update') add(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Body() dto: AddLeaseGuarantorDto,
  ): Promise<LeaseGuarantor> {
    return this.service.add(o, leaseId, dto);
  }

  @Patch(':id') @RequirePermissions('lease:update') update(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaseGuarantorDto,
  ): Promise<LeaseGuarantor> {
    return this.service.update(o, leaseId, id, dto);
  }

  @Delete(':id') @HttpCode(204) @RequirePermissions('lease:update') async remove(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.remove(o, leaseId, id);
  }
}
