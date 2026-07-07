import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Area, type City, type Country, type District, type State } from '@prisma/client';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../common/auth/require-permissions.decorator';

import {
  CreateAreaDto,
  CreateCityDto,
  CreateCountryDto,
  CreateDistrictDto,
  CreateStateDto,
  UpdateAreaDto,
  UpdateCityDto,
  UpdateCountryDto,
  UpdateDistrictDto,
  UpdateStateDto,
} from './dto/geo.dto';
import { GeoService } from './geo.service';

@ApiTags('Geography — Countries')
@ApiBearerAuth()
@Controller('geo/countries')
export class CountryController {
  constructor(private readonly geo: GeoService) {}

  @Get()
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'List countries' })
  list(@Query('activeOnly') activeOnly?: string): Promise<Country[]> {
    return this.geo.listCountries(activeOnly === 'true');
  }

  @Get(':id')
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'Get a country' })
  get(@Param('id') id: string): Promise<Country> {
    return this.geo.getCountry(id);
  }

  @Post()
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Create a country' })
  create(@Body() dto: CreateCountryDto, @CurrentUser('userId') actorId: string): Promise<Country> {
    return this.geo.createCountry(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Update a country' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCountryDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<Country> {
    return this.geo.updateCountry(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Delete a country' })
  async remove(@Param('id') id: string, @CurrentUser('userId') actorId: string): Promise<void> {
    await this.geo.deleteCountry(id, actorId);
  }
}

@ApiTags('Geography — States')
@ApiBearerAuth()
@Controller('geo/states')
export class StateController {
  constructor(private readonly geo: GeoService) {}

  @Get()
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'List states (optionally by country)' })
  list(@Query('countryId') countryId?: string): Promise<State[]> {
    return this.geo.listStates(countryId);
  }

  @Get(':id')
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'Get a state' })
  get(@Param('id') id: string): Promise<State> {
    return this.geo.getState(id);
  }

  @Post()
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Create a state' })
  create(@Body() dto: CreateStateDto, @CurrentUser('userId') actorId: string): Promise<State> {
    return this.geo.createState(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Update a state' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStateDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<State> {
    return this.geo.updateState(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Delete a state' })
  async remove(@Param('id') id: string, @CurrentUser('userId') actorId: string): Promise<void> {
    await this.geo.deleteState(id, actorId);
  }
}

@ApiTags('Geography — Cities')
@ApiBearerAuth()
@Controller('geo/cities')
export class CityController {
  constructor(private readonly geo: GeoService) {}

  @Get()
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'List cities (optionally by state)' })
  list(@Query('stateId') stateId?: string): Promise<City[]> {
    return this.geo.listCities(stateId);
  }

  @Get(':id')
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'Get a city' })
  get(@Param('id') id: string): Promise<City> {
    return this.geo.getCity(id);
  }

  @Post()
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Create a city' })
  create(@Body() dto: CreateCityDto, @CurrentUser('userId') actorId: string): Promise<City> {
    return this.geo.createCity(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Update a city' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCityDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<City> {
    return this.geo.updateCity(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Delete a city' })
  async remove(@Param('id') id: string, @CurrentUser('userId') actorId: string): Promise<void> {
    await this.geo.deleteCity(id, actorId);
  }
}

@ApiTags('Geography — Districts')
@ApiBearerAuth()
@Controller('geo/districts')
export class DistrictController {
  constructor(private readonly geo: GeoService) {}

  @Get()
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'List districts (optionally by city)' })
  list(@Query('cityId') cityId?: string): Promise<District[]> {
    return this.geo.listDistricts(cityId);
  }

  @Get(':id')
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'Get a district' })
  get(@Param('id') id: string): Promise<District> {
    return this.geo.getDistrict(id);
  }

  @Post()
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Create a district' })
  create(
    @Body() dto: CreateDistrictDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<District> {
    return this.geo.createDistrict(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Update a district' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDistrictDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<District> {
    return this.geo.updateDistrict(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Delete a district' })
  async remove(@Param('id') id: string, @CurrentUser('userId') actorId: string): Promise<void> {
    await this.geo.deleteDistrict(id, actorId);
  }
}

@ApiTags('Geography — Areas')
@ApiBearerAuth()
@Controller('geo/areas')
export class AreaController {
  constructor(private readonly geo: GeoService) {}

  @Get()
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'List areas (optionally by district)' })
  list(@Query('districtId') districtId?: string): Promise<Area[]> {
    return this.geo.listAreas(districtId);
  }

  @Get(':id')
  @RequirePermissions('geography:read')
  @ApiOperation({ summary: 'Get an area' })
  get(@Param('id') id: string): Promise<Area> {
    return this.geo.getArea(id);
  }

  @Post()
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Create an area' })
  create(@Body() dto: CreateAreaDto, @CurrentUser('userId') actorId: string): Promise<Area> {
    return this.geo.createArea(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Update an area' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAreaDto,
    @CurrentUser('userId') actorId: string,
  ): Promise<Area> {
    return this.geo.updateArea(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('geography:manage')
  @ApiOperation({ summary: 'Delete an area' })
  async remove(@Param('id') id: string, @CurrentUser('userId') actorId: string): Promise<void> {
    await this.geo.deleteArea(id, actorId);
  }
}
