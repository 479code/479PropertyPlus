import { Module } from '@nestjs/common';

import { OrganizationModule } from '../../organization/organization.module';

import { LateFeeRuleRepository } from './late-fee-rule.repository';
import { LeaseSettingsController } from './lease-settings.controller';
import { LeaseSettingsRepository } from './lease-settings.repository';
import { LeaseSettingsService } from './lease-settings.service';

@Module({
  imports: [OrganizationModule],
  controllers: [LeaseSettingsController],
  providers: [LeaseSettingsService, LeaseSettingsRepository, LateFeeRuleRepository],
})
export class LeaseSettingsModule {}
