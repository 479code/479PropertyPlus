import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { LeaseDashboardService, type LeaseDashboardSummary } from './lease-dashboard.service';

@ApiTags('Lease Dashboard')
@ApiBearerAuth()
@Controller('leases-dashboard')
export class LeaseDashboardController {
  constructor(private readonly service: LeaseDashboardService) {}

  @Get()
  @RequirePermissions('lease:read')
  @ApiOperation({ summary: 'Lease & occupancy dashboard summary' })
  getSummary(@OrgId() organizationId: string): Promise<LeaseDashboardSummary> {
    return this.service.getSummary(organizationId);
  }
}
