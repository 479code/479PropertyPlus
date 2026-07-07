import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type OrganizationInvite } from '@prisma/client';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../common/auth/require-permissions.decorator';
import { OrgId } from '../../common/tenant/tenant.decorators';

import { CreateInviteDto } from './dto/create-invite.dto';
import { type IssuedInvite, OrganizationInviteService } from './organization-invite.service';

@ApiTags('Organization Invitations')
@ApiBearerAuth()
@Controller('organizations/invites')
export class OrganizationInviteController {
  constructor(private readonly service: OrganizationInviteService) {}

  @Post()
  @RequirePermissions('invitation:create')
  @ApiOperation({ summary: 'Invite a user to the active organization' })
  invite(
    @OrgId() organizationId: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<IssuedInvite> {
    return this.service.invite(organizationId, dto, actorId);
  }

  @Get()
  @RequirePermissions('invitation:read')
  @ApiOperation({ summary: 'List invitations for the active organization' })
  list(@OrgId() organizationId: string): Promise<OrganizationInvite[]> {
    return this.service.list(organizationId);
  }

  @Post(':id/resend')
  @RequirePermissions('invitation:resend')
  @ApiOperation({ summary: 'Regenerate and resend an invitation' })
  resend(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<IssuedInvite> {
    return this.service.resend(organizationId, id, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('invitation:cancel')
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  async cancel(
    @OrgId() organizationId: string,
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ): Promise<void> {
    await this.service.cancel(organizationId, id, actorId);
  }
}
