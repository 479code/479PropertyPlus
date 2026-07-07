import { Global, Module } from '@nestjs/common';

import { MembershipRepository } from './membership.repository';
import { MembershipService } from './membership.service';

/**
 * Global so auth (signup/switch) and invitations can create and resolve
 * memberships without repeated imports.
 */
@Global()
@Module({
  providers: [MembershipService, MembershipRepository],
  exports: [MembershipService, MembershipRepository],
})
export class MembershipModule {}
