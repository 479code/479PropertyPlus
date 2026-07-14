import { type Paginated } from '@479property/types';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Lease } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import {
  CreateLeaseDto,
  SearchLeaseDto,
  TerminateLeaseDto,
  TransitionLeaseDto,
  UpdateLeaseDto,
} from './dto/lease.dto';
import { LeaseService } from './lease.service';

@ApiTags('Leases')
@ApiBearerAuth()
@Controller('leases')
export class LeaseController {
  constructor(private readonly service: LeaseService) {}

  @Post()
  @RequirePermissions('lease:create')
  @ApiOperation({ summary: 'Create a lease (starts in Draft status)' })
  create(
    @OrgId() o: string,
    @Body() dto: CreateLeaseDto,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.create(o, dto, a);
  }

  @Get()
  @RequirePermissions('lease:read')
  @ApiOperation({ summary: 'Search leases' })
  search(@OrgId() o: string, @Query() q: SearchLeaseDto): Promise<Paginated<Lease>> {
    return this.service.search(o, q);
  }

  @Get(':id')
  @RequirePermissions('lease:read')
  get(@OrgId() o: string, @Param('id') id: string): Promise<Lease> {
    return this.service.get(o, id, true);
  }

  @Patch(':id')
  @RequirePermissions('lease:update')
  @ApiOperation({
    summary: 'Update a lease (Draft or Rejected only — use transition endpoints otherwise)',
  })
  update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaseDto,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.update(o, id, dto, a);
  }

  @Post(':id/submit')
  @RequirePermissions('lease:update')
  @ApiOperation({ summary: 'Draft/Rejected -> Pending Approval' })
  submit(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.submit(o, id, a);
  }

  @Post(':id/approve')
  @RequirePermissions('lease:approve')
  @ApiOperation({ summary: 'Pending Approval -> Awaiting Signature' })
  approve(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.approve(o, id, a);
  }

  @Post(':id/reject')
  @RequirePermissions('lease:approve')
  @ApiOperation({ summary: 'Pending Approval / Awaiting Signature -> Rejected' })
  reject(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: TransitionLeaseDto,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.reject(o, id, dto.reason, a);
  }

  @Post(':id/activate')
  @RequirePermissions('lease:activate')
  @ApiOperation({
    summary:
      'Awaiting Signature -> Active (also records signing; occupancy engine + final overlap check run here)',
  })
  activate(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.activate(o, id, a);
  }

  @Post(':id/renewals/initiate')
  @RequirePermissions('lease:renew')
  @ApiOperation({ summary: 'Active -> Renewal Pending' })
  initiateRenewal(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.initiateRenewal(o, id, a);
  }

  @Post(':id/renewals/complete')
  @RequirePermissions('lease:renew')
  @ApiOperation({ summary: 'Renewal Pending -> Active, extending leaseEndDate' })
  completeRenewal(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body('newEndDate') newEndDate: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.completeRenewal(o, id, newEndDate, a);
  }

  @Post(':id/renewals/reject')
  @RequirePermissions('lease:renew')
  @ApiOperation({
    summary: 'Renewal Pending -> Active, renewal rejected (lease continues unchanged)',
  })
  rejectRenewal(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.rejectRenewal(o, id, a);
  }

  @Post(':id/terminate')
  @RequirePermissions('lease:terminate')
  @ApiOperation({ summary: 'Active / Renewal Pending -> Terminated' })
  terminate(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: TerminateLeaseDto,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.terminate(o, id, dto, a);
  }

  @Post(':id/archive')
  @RequirePermissions('lease:archive')
  @ApiOperation({ summary: 'Expired / Terminated -> Archived' })
  archive(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.archive(o, id, a);
  }

  @Post(':id/restore')
  @RequirePermissions('lease:restore')
  restore(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Lease> {
    return this.service.restore(o, id, a);
  }
}
