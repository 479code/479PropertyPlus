import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';

import { GeoRepository } from './geo.repository';

const NIGERIA_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
  'Federal Capital Territory',
];

// A representative Lagos hierarchy so the full Country→…→Area tree is demonstrable.
const LAGOS_SAMPLE: Record<string, Record<string, string[]>> = {
  Ikeja: { GRA: ['Phase 1', 'Phase 2'], Alausa: ['Secretariat'] },
  Lekki: { 'Phase 1': ['Admiralty Way'], Ikate: ['Elegushi'] },
  Eti_Osa: { 'Victoria Island': ['Oniru', 'Adeola Odeku'] },
};

@Injectable()
export class GeoSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(GeoSeederService.name);

  constructor(private readonly repository: GeoRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.seedNigeria();
    } catch (error) {
      // Seeding must never crash boot; log and continue.
      this.logger.error('Geographic seeding failed', error as Error);
    }
  }

  /** Idempotently ensure Nigeria, its states, and a sample Lagos tree exist. */
  async seedNigeria(): Promise<void> {
    const existing = await this.repository.findCountryByIso('NG');
    if (existing) {
      return;
    }

    const nigeria = await this.repository.createCountry({
      name: 'Nigeria',
      isoCode: 'NG',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      isActive: true,
    });

    let lagosId: string | null = null;
    for (const name of NIGERIA_STATES) {
      const state = await this.repository.createState({ countryId: nigeria.id, name });
      if (name === 'Lagos') lagosId = state.id;
    }

    if (lagosId) {
      for (const [cityName, districts] of Object.entries(LAGOS_SAMPLE)) {
        const city = await this.repository.createCity({
          stateId: lagosId,
          name: cityName.replace('_', '-'),
        });
        for (const [districtName, areas] of Object.entries(districts)) {
          const district = await this.repository.createDistrict({
            cityId: city.id,
            name: districtName,
          });
          for (const areaName of areas) {
            await this.repository.createArea({ districtId: district.id, name: areaName });
          }
        }
      }
    }

    this.logger.log(
      `Seeded Nigeria with ${NIGERIA_STATES.length} states and a sample Lagos hierarchy`,
    );
  }
}
