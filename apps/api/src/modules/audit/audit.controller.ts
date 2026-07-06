import { type Paginated } from '@479property/types';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { OrgId } from '../../common/tenant/tenant.decorators';

import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';

@ApiTags('Audit')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit log entries for the current organization' })
  list(
    @OrgId() organizationId: string,
    @Query() query: QueryAuditDto,
  ): Promise<Paginated<unknown>> {
    return this.auditService.query(organizationId, query);
  }
}
