import { Global, Module } from '@nestjs/common';

import { OrganizationInviteController } from './organization-invite.controller';
import { OrganizationInviteRepository } from './organization-invite.repository';
import { OrganizationInviteService } from './organization-invite.service';

/**
 * Global so the auth flow (accept-invite) can consume invitations without a
 * circular module import.
 */
@Global()
@Module({
  controllers: [OrganizationInviteController],
  providers: [OrganizationInviteService, OrganizationInviteRepository],
  exports: [OrganizationInviteService],
})
export class InvitesModule {}
