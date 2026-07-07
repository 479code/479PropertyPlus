import { Global, Module } from '@nestjs/common';

import { MeController } from './me.controller';
import { UserPreferenceRepository } from './user-preference.repository';
import { UserPreferenceService } from './user-preference.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * Global so the auth flow can inject UsersService/UsersRepository for the signup
 * and login paths without circular module imports.
 */
@Global()
@Module({
  controllers: [MeController],
  providers: [UsersService, UsersRepository, UserPreferenceService, UserPreferenceRepository],
  exports: [UsersService, UsersRepository, UserPreferenceService],
})
export class UsersModule {}
