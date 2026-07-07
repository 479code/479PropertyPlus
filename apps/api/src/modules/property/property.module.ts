import { Module } from '@nestjs/common';

import { ConfigurationModule } from '../config/configuration.module';

import {
  PropertyFeatureController,
  PropertyStatusController,
  PropertyTagController,
  PropertyTypeController,
} from './config/property-config.controllers';
import { PropertyConfigRepository } from './config/property-config.repository';
import { PropertyConfigService } from './config/property-config.service';
import {
  PropertyDocumentController,
  PropertyImageController,
} from './media/property-media.controller';
import { PropertyMediaRepository } from './media/property-media.repository';
import { PropertyMediaService } from './media/property-media.service';
import { PropertyController } from './property.controller';
import { PropertyRepository } from './property.repository';
import { PropertyService } from './property.service';

@Module({
  imports: [ConfigurationModule],
  controllers: [
    PropertyController,
    PropertyTypeController,
    PropertyStatusController,
    PropertyFeatureController,
    PropertyTagController,
    PropertyImageController,
    PropertyDocumentController,
  ],
  providers: [
    PropertyService,
    PropertyRepository,
    PropertyConfigService,
    PropertyConfigRepository,
    PropertyMediaService,
    PropertyMediaRepository,
  ],
  exports: [PropertyConfigService],
})
export class PropertyModule {}
