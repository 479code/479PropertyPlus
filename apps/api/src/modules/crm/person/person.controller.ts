import { type Paginated } from '@479property/types';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Person } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CreatePersonDto, SearchPersonDto, UpdatePersonDto } from './dto/person.dto';
import { PersonService } from './person.service';

@ApiTags('People')
@ApiBearerAuth()
@Controller('people')
export class PersonController {
  constructor(private readonly service: PersonService) {}

  @Post()
  @RequirePermissions('person:create')
  @ApiOperation({ summary: 'Create a person (auto code + slug; optional role assignment)' })
  create(
    @OrgId() o: string,
    @Body() dto: CreatePersonDto,
    @CurrentUser('userId') a: string,
  ): Promise<Person> {
    return this.service.create(o, dto, a);
  }

  @Get()
  @RequirePermissions('person:read')
  @ApiOperation({ summary: 'Search people' })
  search(@OrgId() o: string, @Query() q: SearchPersonDto): Promise<Paginated<Person>> {
    return this.service.search(o, q);
  }

  @Get(':id')
  @RequirePermissions('person:read')
  @ApiOperation({ summary: 'Get a person' })
  get(@OrgId() o: string, @Param('id') id: string): Promise<Person> {
    return this.service.get(o, id, true);
  }

  @Patch(':id')
  @RequirePermissions('person:update')
  @ApiOperation({ summary: 'Update a person' })
  update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
    @CurrentUser('userId') a: string,
  ): Promise<Person> {
    return this.service.update(o, id, dto, a);
  }

  @Post(':id/archive')
  @HttpCode(204)
  @RequirePermissions('person:archive')
  @ApiOperation({ summary: 'Archive a person' })
  async archive(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.archive(o, id, a);
  }

  @Post(':id/restore')
  @RequirePermissions('person:restore')
  @ApiOperation({ summary: 'Restore an archived person' })
  restore(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<Person> {
    return this.service.restore(o, id, a);
  }

  @Post(':id/tags/:tagId')
  @RequirePermissions('person:update')
  @ApiOperation({ summary: 'Assign a tag to a person' })
  addTag(
    @OrgId() o: string,
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @CurrentUser('userId') a: string,
  ): Promise<Person> {
    return this.service.addTag(o, id, tagId, a);
  }

  @Delete(':id/tags/:tagId')
  @RequirePermissions('person:update')
  @ApiOperation({ summary: 'Remove a tag from a person' })
  removeTag(
    @OrgId() o: string,
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @CurrentUser('userId') a: string,
  ): Promise<Person> {
    return this.service.removeTag(o, id, tagId, a);
  }
}
