import { Module } from '@nestjs/common';

import { OrganizationModule } from '../../organization/organization.module';

import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsRepository } from './feature-flags.repository';
import { FeatureFlagsService } from './feature-flags.service';

@Module({
  imports: [OrganizationModule],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService, FeatureFlagsRepository],
})
export class FeatureFlagsModule {}
