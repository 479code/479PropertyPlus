import { Module } from '@nestjs/common';

import { ConfigurationModule } from '../config/configuration.module';

import { CompanyController } from './company/company.controller';
import { CompanyRepository } from './company/company.repository';
import { CompanyService } from './company/company.service';
import { PersonTagController, PersonTypeController } from './config/crm-config.controllers';
import { CrmConfigRepository } from './config/crm-config.repository';
import { CrmConfigService } from './config/crm-config.service';
import { ContactHistoryController } from './contact-history/contact-history.controller';
import { ContactHistoryRepository } from './contact-history/contact-history.repository';
import { ContactHistoryService } from './contact-history/contact-history.service';
import { CrmDashboardController } from './dashboard/crm-dashboard.controller';
import { CrmDashboardService } from './dashboard/crm-dashboard.service';
import { PersonDocumentController } from './documents/person-document.controller';
import { PersonDocumentRepository } from './documents/person-document.repository';
import { PersonDocumentService } from './documents/person-document.service';
import { EmergencyContactController } from './emergency-contact/emergency-contact.controller';
import { EmergencyContactRepository } from './emergency-contact/emergency-contact.repository';
import { EmergencyContactService } from './emergency-contact/emergency-contact.service';
import { PersonController } from './person/person.controller';
import { PersonRepository } from './person/person.repository';
import { PersonService } from './person/person.service';
import {
  AgentProfileController,
  OwnerProfileController,
  TenantProfileController,
} from './profiles/profile.controller';
import { ProfileRepository } from './profiles/profile.repository';
import { ProfileService } from './profiles/profile.service';

@Module({
  imports: [ConfigurationModule],
  controllers: [
    PersonTypeController,
    PersonTagController,
    PersonController,
    CompanyController,
    TenantProfileController,
    AgentProfileController,
    OwnerProfileController,
    EmergencyContactController,
    PersonDocumentController,
    ContactHistoryController,
    CrmDashboardController,
  ],
  providers: [
    CrmConfigRepository,
    CrmConfigService,
    PersonRepository,
    PersonService,
    CompanyRepository,
    CompanyService,
    ProfileRepository,
    ProfileService,
    EmergencyContactRepository,
    EmergencyContactService,
    PersonDocumentRepository,
    PersonDocumentService,
    ContactHistoryRepository,
    ContactHistoryService,
    CrmDashboardService,
  ],
  exports: [CrmConfigService],
})
export class CrmModule {}
