import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type LeaseStatus, type LeaseType, type PaymentFrequency } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import {
  CreateLeaseTypeDto,
  CreatePaymentFrequencyDto,
  UpdateLeaseStatusDto,
  UpdateLeaseTypeDto,
  UpdatePaymentFrequencyDto,
} from './dto/lease-config.dto';
import { LeaseConfigService } from './lease-config.service';

@ApiTags('Lease Types')
@ApiBearerAuth()
@Controller('lease-types')
export class LeaseTypeController {
  constructor(private readonly service: LeaseConfigService) {}

  @Get() @RequirePermissions('lease:read') list(@OrgId() o: string): Promise<LeaseType[]> {
    return this.service.listLeaseTypes(o);
  }
  @Post() @RequirePermissions('lease:create') create(
    @OrgId() o: string,
    @Body() dto: CreateLeaseTypeDto,
    @CurrentUser('userId') a: string,
  ): Promise<LeaseType> {
    return this.service.createLeaseType(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('lease:update') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaseTypeDto,
    @CurrentUser('userId') a: string,
  ): Promise<LeaseType> {
    return this.service.updateLeaseType(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('lease:archive') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removeLeaseType(o, id, a);
  }
}

@ApiTags('Payment Frequencies')
@ApiBearerAuth()
@Controller('payment-frequencies')
export class PaymentFrequencyController {
  constructor(private readonly service: LeaseConfigService) {}

  @Get() @RequirePermissions('lease:read') list(@OrgId() o: string): Promise<PaymentFrequency[]> {
    return this.service.listPaymentFrequencies(o);
  }
  @Post() @RequirePermissions('lease:create') create(
    @OrgId() o: string,
    @Body() dto: CreatePaymentFrequencyDto,
    @CurrentUser('userId') a: string,
  ): Promise<PaymentFrequency> {
    return this.service.createPaymentFrequency(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('lease:update') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentFrequencyDto,
    @CurrentUser('userId') a: string,
  ): Promise<PaymentFrequency> {
    return this.service.updatePaymentFrequency(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('lease:archive') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removePaymentFrequency(o, id, a);
  }
}

@ApiTags('Lease Statuses')
@ApiBearerAuth()
@Controller('lease-statuses')
export class LeaseStatusController {
  constructor(private readonly service: LeaseConfigService) {}

  @Get()
  @RequirePermissions('lease:read')
  @ApiOperation({
    summary: 'List the lease lifecycle statuses (system-backed, display fields only are editable)',
  })
  list(@OrgId() o: string): Promise<LeaseStatus[]> {
    return this.service.listLeaseStatuses(o);
  }

  @Patch(':id')
  @RequirePermissions('lease:update')
  @ApiOperation({
    summary:
      'Rename/recolor a lease status (key and business flags are structural and not editable)',
  })
  update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaseStatusDto,
    @CurrentUser('userId') a: string,
  ): Promise<LeaseStatus> {
    return this.service.updateLeaseStatus(o, id, dto, a);
  }
}
