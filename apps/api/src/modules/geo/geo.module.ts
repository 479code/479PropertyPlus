import { Global, Module } from '@nestjs/common';

import { GeoSeederService } from './geo-seeder.service';
import {
  AreaController,
  CityController,
  CountryController,
  DistrictController,
  StateController,
} from './geo.controllers';
import { GeoRepository } from './geo.repository';
import { GeoService } from './geo.service';

/**
 * Global reference-data module. Exports GeoService/GeoRepository so the property
 * layer can validate location foreign keys.
 */
@Global()
@Module({
  controllers: [
    CountryController,
    StateController,
    CityController,
    DistrictController,
    AreaController,
  ],
  providers: [GeoService, GeoRepository, GeoSeederService],
  exports: [GeoService, GeoRepository],
})
export class GeoModule {}
