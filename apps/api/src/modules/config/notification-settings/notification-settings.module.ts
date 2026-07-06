import { Module } from '@nestjs/common';

import { OrganizationModule } from '../../organization/organization.module';

import { NotificationSettingsController } from './notification-settings.controller';
import { NotificationSettingsRepository } from './notification-settings.repository';
import { NotificationSettingsService } from './notification-settings.service';

@Module({
  imports: [OrganizationModule],
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService, NotificationSettingsRepository],
})
export class NotificationSettingsModule {}
