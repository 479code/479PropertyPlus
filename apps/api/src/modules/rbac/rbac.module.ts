import { Global, Module } from '@nestjs/common';

import { RbacController } from './rbac.controller';
import { RbacRepository } from './rbac.repository';
import { RbacService } from './rbac.service';

/**
 * Global so guards and the auth/provisioning flow can resolve permissions and
 * seed roles without re-importing the module everywhere.
 */
@Global()
@Module({
  controllers: [RbacController],
  providers: [RbacService, RbacRepository],
  exports: [RbacService],
})
export class RbacModule {}
