import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { ConfigurationModule } from '../config/configuration.module';
import { PropertyModule } from '../property/property.module';

import { AvailabilityService } from './availability/availability.service';
import { BuildingController } from './building/building.controller';
import { BuildingRepository } from './building/building.repository';
import { BuildingService } from './building/building.service';
import {
  BuildingStatusController,
  UnitFeatureController,
  UnitStatusController,
  UnitTypeController,
} from './config/inventory-config.controllers';
import { InventoryConfigRepository } from './config/inventory-config.repository';
import { InventoryConfigService } from './config/inventory-config.service';
import { CountsService } from './counts/counts.service';
import { FloorController } from './floor/floor.controller';
import { FloorRepository } from './floor/floor.repository';
import { FloorService } from './floor/floor.service';
import { InventorySummaryController } from './summary/inventory-summary.controller';
import { InventorySummaryService } from './summary/inventory-summary.service';
import { UnitDocumentController, UnitImageController } from './unit/media/unit-media.controller';
import { UnitMediaRepository } from './unit/media/unit-media.repository';
import { UnitMediaService } from './unit/media/unit-media.service';
import { UnitEventsRepository } from './unit/unit-events.repository';
import { UnitController } from './unit/unit.controller';
import { UnitRepository } from './unit/unit.repository';
import { UnitService } from './unit/unit.service';

@Module({
  imports: [AuditModule, ConfigurationModule, PropertyModule],
  controllers: [
    BuildingStatusController,
    UnitTypeController,
    UnitStatusController,
    UnitFeatureController,
    BuildingController,
    FloorController,
    UnitController,
    UnitImageController,
    UnitDocumentController,
    InventorySummaryController,
  ],
  providers: [
    AvailabilityService,
    CountsService,
    InventoryConfigRepository,
    InventoryConfigService,
    BuildingRepository,
    BuildingService,
    FloorRepository,
    FloorService,
    UnitRepository,
    UnitEventsRepository,
    UnitService,
    UnitMediaRepository,
    UnitMediaService,
    InventorySummaryService,
  ],
  exports: [InventoryConfigService, AvailabilityService],
})
export class InventoryModule {}
