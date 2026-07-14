import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CrmDashboardService, type CrmDashboardSummary } from './crm-dashboard.service';

@ApiTags('CRM Dashboard')
@ApiBearerAuth()
@Controller('crm/dashboard')
export class CrmDashboardController {
  constructor(private readonly service: CrmDashboardService) {}

  @Get()
  @RequirePermissions('person:read')
  @ApiOperation({
    summary:
      'CRM dashboard summary: tenants, owners, agents, inactive contacts, upcoming ID expiry',
  })
  getSummary(@OrgId() organizationId: string): Promise<CrmDashboardSummary> {
    return this.service.getSummary(organizationId);
  }
}
