import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Area, type City, type Country, type District, type State } from '@prisma/client';

import { AuditService } from '../audit/audit.service';

import {
  type CreateAreaDto,
  type CreateCityDto,
  type CreateCountryDto,
  type CreateDistrictDto,
  type CreateStateDto,
  type UpdateAreaDto,
  type UpdateCityDto,
  type UpdateCountryDto,
  type UpdateDistrictDto,
  type UpdateStateDto,
} from './dto/geo.dto';
import { GeoRepository } from './geo.repository';

@Injectable()
export class GeoService {
  constructor(
    private readonly repository: GeoRepository,
    private readonly audit: AuditService,
  ) {}

  private auditGeo(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    actorId?: string,
  ): Promise<void> {
    // Geographic data is global (no organizationId); audit rows capture system-level changes.
    return this.audit.record({
      organizationId: null,
      userId: actorId,
      action,
      entityType,
      entityId,
    });
  }

  // ── Countries ──
  listCountries(activeOnly = false): Promise<Country[]> {
    return this.repository.listCountries(activeOnly);
  }
  async getCountry(id: string): Promise<Country> {
    const country = await this.repository.findCountry(id);
    if (!country) throw new NotFoundException(`Country ${id} not found`);
    return country;
  }
  async createCountry(dto: CreateCountryDto, actorId?: string): Promise<Country> {
    if (await this.repository.findCountryByIso(dto.isoCode)) {
      throw new ConflictException(
        `Country with ISO code ${dto.isoCode.toUpperCase()} already exists`,
      );
    }
    const country = await this.repository.createCountry(dto);
    await this.auditGeo('CREATE', 'Country', country.id, actorId);
    return country;
  }
  async updateCountry(id: string, dto: UpdateCountryDto, actorId?: string): Promise<Country> {
    await this.getCountry(id);
    const { isoCode: _isoCode, ...rest } = dto;
    const country = await this.repository.updateCountry(id, rest);
    await this.auditGeo('UPDATE', 'Country', id, actorId);
    return country;
  }
  async deleteCountry(id: string, actorId?: string): Promise<void> {
    await this.getCountry(id);
    await this.repository.deleteCountry(id);
    await this.auditGeo('DELETE', 'Country', id, actorId);
  }

  // ── States ──
  listStates(countryId?: string): Promise<State[]> {
    return this.repository.listStates(countryId);
  }
  async getState(id: string): Promise<State> {
    const state = await this.repository.findState(id);
    if (!state) throw new NotFoundException(`State ${id} not found`);
    return state;
  }
  async createState(dto: CreateStateDto, actorId?: string): Promise<State> {
    if (!(await this.repository.findCountry(dto.countryId))) {
      throw new BadRequestException('countryId does not reference an existing country');
    }
    const state = await this.repository.createState(dto);
    await this.auditGeo('CREATE', 'State', state.id, actorId);
    return state;
  }
  async updateState(id: string, dto: UpdateStateDto, actorId?: string): Promise<State> {
    await this.getState(id);
    const state = await this.repository.updateState(id, { name: dto.name, code: dto.code });
    await this.auditGeo('UPDATE', 'State', id, actorId);
    return state;
  }
  async deleteState(id: string, actorId?: string): Promise<void> {
    await this.getState(id);
    await this.repository.deleteState(id);
    await this.auditGeo('DELETE', 'State', id, actorId);
  }

  // ── Cities ──
  listCities(stateId?: string): Promise<City[]> {
    return this.repository.listCities(stateId);
  }
  async getCity(id: string): Promise<City> {
    const city = await this.repository.findCity(id);
    if (!city) throw new NotFoundException(`City ${id} not found`);
    return city;
  }
  async createCity(dto: CreateCityDto, actorId?: string): Promise<City> {
    if (!(await this.repository.findState(dto.stateId))) {
      throw new BadRequestException('stateId does not reference an existing state');
    }
    const city = await this.repository.createCity(dto);
    await this.auditGeo('CREATE', 'City', city.id, actorId);
    return city;
  }
  async updateCity(id: string, dto: UpdateCityDto, actorId?: string): Promise<City> {
    await this.getCity(id);
    const city = await this.repository.updateCity(id, { name: dto.name });
    await this.auditGeo('UPDATE', 'City', id, actorId);
    return city;
  }
  async deleteCity(id: string, actorId?: string): Promise<void> {
    await this.getCity(id);
    await this.repository.deleteCity(id);
    await this.auditGeo('DELETE', 'City', id, actorId);
  }

  // ── Districts ──
  listDistricts(cityId?: string): Promise<District[]> {
    return this.repository.listDistricts(cityId);
  }
  async getDistrict(id: string): Promise<District> {
    const district = await this.repository.findDistrict(id);
    if (!district) throw new NotFoundException(`District ${id} not found`);
    return district;
  }
  async createDistrict(dto: CreateDistrictDto, actorId?: string): Promise<District> {
    if (!(await this.repository.findCity(dto.cityId))) {
      throw new BadRequestException('cityId does not reference an existing city');
    }
    const district = await this.repository.createDistrict(dto);
    await this.auditGeo('CREATE', 'District', district.id, actorId);
    return district;
  }
  async updateDistrict(id: string, dto: UpdateDistrictDto, actorId?: string): Promise<District> {
    await this.getDistrict(id);
    const district = await this.repository.updateDistrict(id, { name: dto.name });
    await this.auditGeo('UPDATE', 'District', id, actorId);
    return district;
  }
  async deleteDistrict(id: string, actorId?: string): Promise<void> {
    await this.getDistrict(id);
    await this.repository.deleteDistrict(id);
    await this.auditGeo('DELETE', 'District', id, actorId);
  }

  // ── Areas ──
  listAreas(districtId?: string): Promise<Area[]> {
    return this.repository.listAreas(districtId);
  }
  async getArea(id: string): Promise<Area> {
    const area = await this.repository.findArea(id);
    if (!area) throw new NotFoundException(`Area ${id} not found`);
    return area;
  }
  async createArea(dto: CreateAreaDto, actorId?: string): Promise<Area> {
    if (!(await this.repository.findDistrict(dto.districtId))) {
      throw new BadRequestException('districtId does not reference an existing district');
    }
    const area = await this.repository.createArea(dto);
    await this.auditGeo('CREATE', 'Area', area.id, actorId);
    return area;
  }
  async updateArea(id: string, dto: UpdateAreaDto, actorId?: string): Promise<Area> {
    await this.getArea(id);
    const area = await this.repository.updateArea(id, { name: dto.name });
    await this.auditGeo('UPDATE', 'Area', id, actorId);
    return area;
  }
  async deleteArea(id: string, actorId?: string): Promise<void> {
    await this.getArea(id);
    await this.repository.deleteArea(id);
    await this.auditGeo('DELETE', 'Area', id, actorId);
  }
}
