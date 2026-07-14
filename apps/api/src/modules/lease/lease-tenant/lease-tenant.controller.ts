import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type LeaseTenant } from '@prisma/client';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { AddLeaseTenantDto, UpdateLeaseTenantDto } from './dto/lease-tenant.dto';
import { LeaseTenantService } from './lease-tenant.service';

@ApiTags('Lease Tenants')
@ApiBearerAuth()
@Controller('leases/:leaseId/tenants')
export class LeaseTenantController {
  constructor(private readonly service: LeaseTenantService) {}

  @Get() @RequirePermissions('lease:read') list(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
  ): Promise<LeaseTenant[]> {
    return this.service.list(o, leaseId);
  }

  @Post() @RequirePermissions('lease:update') add(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Body() dto: AddLeaseTenantDto,
  ): Promise<LeaseTenant> {
    return this.service.add(o, leaseId, dto);
  }

  @Patch(':id') @RequirePermissions('lease:update') update(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaseTenantDto,
  ): Promise<LeaseTenant> {
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
