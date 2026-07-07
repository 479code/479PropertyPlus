import { BadRequestException, ConflictException } from '@nestjs/common';

import { type AuditService } from '../audit/audit.service';

import { type GeoRepository } from './geo.repository';
import { GeoService } from './geo.service';

function build() {
  const repository = {
    findCountryByIso: jest.fn().mockResolvedValue(null),
    createCountry: jest.fn().mockResolvedValue({ id: 'c1' }),
    findCountry: jest.fn(),
    createState: jest.fn().mockResolvedValue({ id: 's1' }),
  } as unknown as GeoRepository;
  const audit = { record: jest.fn() } as unknown as AuditService;
  return { service: new GeoService(repository, audit), repository };
}

describe('GeoService', () => {
  it('rejects a duplicate country ISO code', async () => {
    const { service, repository } = build();
    (repository.findCountryByIso as jest.Mock).mockResolvedValue({ id: 'existing' });
    await expect(
      service.createCountry({ name: 'Nigeria', isoCode: 'NG' }, 'u1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a state whose country does not exist', async () => {
    const { service, repository } = build();
    (repository.findCountry as jest.Mock).mockResolvedValue(null);
    await expect(
      service.createState({ countryId: 'missing', name: 'Lagos' }, 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a state under an existing country', async () => {
    const { service, repository } = build();
    (repository.findCountry as jest.Mock).mockResolvedValue({ id: 'c1' });
    await expect(
      service.createState({ countryId: 'c1', name: 'Lagos' }, 'u1'),
    ).resolves.toMatchObject({ id: 's1' });
  });
});
