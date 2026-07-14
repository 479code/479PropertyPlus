import { Module } from '@nestjs/common';

import { ConfigurationModule } from '../config/configuration.module';
import { CrmModule } from '../crm/crm.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PropertyModule } from '../property/property.module';

import {
  LeaseStatusController,
  LeaseTypeController,
  PaymentFrequencyController,
} from './config/lease-config.controllers';
import { LeaseConfigRepository } from './config/lease-config.repository';
import { LeaseConfigService } from './config/lease-config.service';
import { LeaseDashboardController } from './dashboard/lease-dashboard.controller';
import { LeaseDashboardService } from './dashboard/lease-dashboard.service';
import { LeaseExpiryCron } from './lease/lease-expiry.cron';
import { LeaseController } from './lease/lease.controller';
import { LeaseRepository } from './lease/lease.repository';
import { LeaseService } from './lease/lease.service';
import { LeaseDocumentController } from './lease-document/lease-document.controller';
import { LeaseDocumentRepository } from './lease-document/lease-document.repository';
import { LeaseDocumentService } from './lease-document/lease-document.service';
import { LeaseGuarantorController } from './lease-guarantor/lease-guarantor.controller';
import { LeaseGuarantorRepository } from './lease-guarantor/lease-guarantor.repository';
import { LeaseGuarantorService } from './lease-guarantor/lease-guarantor.service';
import { LeaseNoteController } from './lease-note/lease-note.controller';
import { LeaseNoteRepository } from './lease-note/lease-note.repository';
import { LeaseNoteService } from './lease-note/lease-note.service';
import { LeaseTenantController } from './lease-tenant/lease-tenant.controller';
import { LeaseTenantRepository } from './lease-tenant/lease-tenant.repository';
import { LeaseTenantService } from './lease-tenant/lease-tenant.service';
import { LeaseTimelineController } from './lease-timeline/lease-timeline.controller';
import { LeaseTimelineRepository } from './lease-timeline/lease-timeline.repository';
import { LeaseOccupancyService } from './occupancy/lease-occupancy.service';
import { LeaseStateMachineService } from './state-machine/lease-state-machine.service';

@Module({
  imports: [ConfigurationModule, PropertyModule, InventoryModule, CrmModule],
  controllers: [
    LeaseTypeController,
    PaymentFrequencyController,
    LeaseStatusController,
    LeaseController,
    LeaseTenantController,
    LeaseGuarantorController,
    LeaseDocumentController,
    LeaseTimelineController,
    LeaseNoteController,
    LeaseDashboardController,
  ],
  providers: [
    LeaseConfigRepository,
    LeaseConfigService,
    LeaseStateMachineService,
    LeaseOccupancyService,
    LeaseRepository,
    LeaseService,
    LeaseTenantRepository,
    LeaseTenantService,
    LeaseGuarantorRepository,
    LeaseGuarantorService,
    LeaseDocumentRepository,
    LeaseDocumentService,
    LeaseTimelineRepository,
    LeaseNoteRepository,
    LeaseNoteService,
    LeaseDashboardService,
    LeaseExpiryCron,
  ],
  exports: [LeaseConfigService],
})
export class LeaseModule {}
