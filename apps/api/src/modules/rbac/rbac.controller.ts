import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Permission, type Role } from '@prisma/client';

import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { OrgId } from '../../common/tenant/tenant.decorators';

import { RbacService } from './rbac.service';

@ApiTags('Access Control')
@ApiBearerAuth()
@Controller()
export class RbacController {
  constructor(private readonly rbac: RbacService) {}

  @Get('roles')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'List roles defined for the active organization' })
  roles(@OrgId() organizationId: string): Promise<Role[]> {
    return this.rbac.listRoles(organizationId);
  }

  @Get('permissions')
  @RequirePermissions('permission:read')
  @ApiOperation({ summary: 'List the global permission catalog' })
  permissions(): Promise<Permission[]> {
    return this.rbac.listPermissions();
  }
}
