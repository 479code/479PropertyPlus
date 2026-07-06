import { Module } from '@nestjs/common';

import { ConfigurationOptionsController } from './configuration-options.controller';
import { ConfigurationOptionsRepository } from './configuration-options.repository';
import { ConfigurationOptionsService } from './configuration-options.service';

@Module({
  controllers: [ConfigurationOptionsController],
  providers: [ConfigurationOptionsService, ConfigurationOptionsRepository],
  exports: [ConfigurationOptionsService],
})
export class ConfigurationOptionsModule {}
