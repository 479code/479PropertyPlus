import { Module } from '@nestjs/common';

import { OrganizationModule } from '../../organization/organization.module';

import { OrganizationSettingsController } from './organization-settings.controller';
import { OrganizationSettingsRepository } from './organization-settings.repository';
import { OrganizationSettingsService } from './organization-settings.service';

@Module({
  imports: [OrganizationModule],
  controllers: [OrganizationSettingsController],
  providers: [OrganizationSettingsService, OrganizationSettingsRepository],
})
export class OrganizationSettingsModule {}
