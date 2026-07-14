import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type LeaseTimelineEntry } from '@prisma/client';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';

import { LeaseTimelineRepository } from './lease-timeline.repository';

@ApiTags('Lease Timeline')
@ApiBearerAuth()
@Controller('leases/:leaseId/timeline')
export class LeaseTimelineController {
  constructor(private readonly repository: LeaseTimelineRepository) {}

  @Get()
  @RequirePermissions('lease_timeline:view')
  list(@Param('leaseId') leaseId: string): Promise<LeaseTimelineEntry[]> {
    return this.repository.list(leaseId);
  }
}
