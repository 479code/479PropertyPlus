import { Module } from '@nestjs/common';

import { OrganizationModule } from '../../organization/organization.module';

import { PaymentSettingsController } from './payment-settings.controller';
import { PaymentSettingsRepository } from './payment-settings.repository';
import { PaymentSettingsService } from './payment-settings.service';

@Module({
  imports: [OrganizationModule],
  controllers: [PaymentSettingsController],
  providers: [PaymentSettingsService, PaymentSettingsRepository],
})
export class PaymentSettingsModule {}
