import { Injectable } from '@nestjs/common';
import { type Area, type City, type Country, type District, type State } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { type PrismaDb } from '../rbac/rbac.repository';

@Injectable()
export class GeoRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Country ──
  listCountries(activeOnly: boolean): Promise<Country[]> {
    return this.prisma.country.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { name: 'asc' },
    });
  }
  findCountry(id: string): Promise<Country | null> {
    return this.prisma.country.findUnique({ where: { id } });
  }
  findCountryByIso(isoCode: string): Promise<Country | null> {
    return this.prisma.country.findUnique({ where: { isoCode: isoCode.toUpperCase() } });
  }
  createCountry(
    data: {
      name: string;
      isoCode: string;
      currency?: string;
      timezone?: string;
      isActive?: boolean;
    },
    db: PrismaDb = this.prisma,
  ): Promise<Country> {
    return db.country.create({ data: { ...data, isoCode: data.isoCode.toUpperCase() } });
  }
  updateCountry(
    id: string,
    data: Partial<{ name: string; currency: string; timezone: string; isActive: boolean }>,
  ): Promise<Country> {
    return this.prisma.country.update({ where: { id }, data });
  }
  deleteCountry(id: string): Promise<Country> {
    return this.prisma.country.delete({ where: { id } });
  }

  // ── State ──
  listStates(countryId?: string): Promise<State[]> {
    return this.prisma.state.findMany({
      where: countryId ? { countryId } : {},
      orderBy: { name: 'asc' },
    });
  }
  findState(id: string): Promise<State | null> {
    return this.prisma.state.findUnique({ where: { id } });
  }
  createState(
    data: { countryId: string; name: string; code?: string },
    db: PrismaDb = this.prisma,
  ): Promise<State> {
    return db.state.create({ data });
  }
  updateState(id: string, data: Partial<{ name: string; code: string }>): Promise<State> {
    return this.prisma.state.update({ where: { id }, data });
  }
  deleteState(id: string): Promise<State> {
    return this.prisma.state.delete({ where: { id } });
  }

  // ── City ──
  listCities(stateId?: string): Promise<City[]> {
    return this.prisma.city.findMany({
      where: stateId ? { stateId } : {},
      orderBy: { name: 'asc' },
    });
  }
  findCity(id: string): Promise<City | null> {
    return this.prisma.city.findUnique({ where: { id } });
  }
  createCity(data: { stateId: string; name: string }, db: PrismaDb = this.prisma): Promise<City> {
    return db.city.create({ data });
  }
  updateCity(id: string, data: Partial<{ name: string }>): Promise<City> {
    return this.prisma.city.update({ where: { id }, data });
  }
  deleteCity(id: string): Promise<City> {
    return this.prisma.city.delete({ where: { id } });
  }

  // ── District ──
  listDistricts(cityId?: string): Promise<District[]> {
    return this.prisma.district.findMany({
      where: cityId ? { cityId } : {},
      orderBy: { name: 'asc' },
    });
  }
  findDistrict(id: string): Promise<District | null> {
    return this.prisma.district.findUnique({ where: { id } });
  }
  createDistrict(
    data: { cityId: string; name: string },
    db: PrismaDb = this.prisma,
  ): Promise<District> {
    return db.district.create({ data });
  }
  updateDistrict(id: string, data: Partial<{ name: string }>): Promise<District> {
    return this.prisma.district.update({ where: { id }, data });
  }
  deleteDistrict(id: string): Promise<District> {
    return this.prisma.district.delete({ where: { id } });
  }

  // ── Area ──
  listAreas(districtId?: string): Promise<Area[]> {
    return this.prisma.area.findMany({
      where: districtId ? { districtId } : {},
      orderBy: { name: 'asc' },
    });
  }
  findArea(id: string): Promise<Area | null> {
    return this.prisma.area.findUnique({ where: { id } });
  }
  createArea(
    data: { districtId: string; name: string },
    db: PrismaDb = this.prisma,
  ): Promise<Area> {
    return db.area.create({ data });
  }
  updateArea(id: string, data: Partial<{ name: string }>): Promise<Area> {
    return this.prisma.area.update({ where: { id }, data });
  }
  deleteArea(id: string): Promise<Area> {
    return this.prisma.area.delete({ where: { id } });
  }
}
