import { Module } from '@nestjs/common';

import { OrganizationModule } from '../../organization/organization.module';

import { NumberGeneratorService } from './number-generator.service';
import { NumberingController } from './numbering.controller';
import { NumberingRepository } from './numbering.repository';
import { NumberingService } from './numbering.service';

@Module({
  imports: [OrganizationModule],
  controllers: [NumberingController],
  providers: [NumberingService, NumberGeneratorService, NumberingRepository],
  exports: [NumberGeneratorService],
})
export class NumberingModule {}
