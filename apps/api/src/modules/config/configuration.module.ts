import { Module } from '@nestjs/common';

import { ConfigurationOptionsModule } from './configuration-options/configuration-options.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { LeaseSettingsModule } from './lease-settings/lease-settings.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { NumberingModule } from './numbering/numbering.module';
import { OrganizationSettingsModule } from './organization-settings/organization-settings.module';
import { PaymentSettingsModule } from './payment-settings/payment-settings.module';

/**
 * Aggregates every System Configuration Engine sub-module under a single import.
 * Re-exports NumberingModule so downstream domain modules (properties, leases,
 * payments…) can inject NumberGeneratorService without wiring numbering directly.
 */
@Module({
  imports: [
    OrganizationSettingsModule,
    ConfigurationOptionsModule,
    LeaseSettingsModule,
    PaymentSettingsModule,
    NotificationSettingsModule,
    NumberingModule,
    FeatureFlagsModule,
  ],
  exports: [NumberingModule],
})
export class ConfigurationModule {}
