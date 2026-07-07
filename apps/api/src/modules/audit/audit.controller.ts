import { type Paginated } from '@479property/types';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { OrgId } from '../../common/tenant/tenant.decorators';

import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'List audit log entries for the current organization' })
  list(
    @OrgId() organizationId: string,
    @Query() query: QueryAuditDto,
  ): Promise<Paginated<unknown>> {
    return this.auditService.query(organizationId, query);
  }
}
