import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import {
  InventorySummaryService,
  type PropertyInventorySummary,
} from './inventory-summary.service';

@ApiTags('Inventory Summary')
@ApiBearerAuth()
@Controller('properties/:propertyId/inventory-summary')
export class InventorySummaryController {
  constructor(private readonly summary: InventorySummaryService) {}

  @Get()
  @RequirePermissions('unit:read')
  @ApiOperation({ summary: 'Executive inventory summary for a property' })
  get(
    @OrgId() o: string,
    @Param('propertyId') propertyId: string,
  ): Promise<PropertyInventorySummary> {
    return this.summary.propertyInventorySummary(o, propertyId);
  }
}
