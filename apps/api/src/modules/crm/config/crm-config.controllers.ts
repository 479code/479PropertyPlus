import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type PersonTag, type PersonType } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CrmConfigService } from './crm-config.service';
import {
  CreatePersonTagDto,
  CreatePersonTypeDto,
  UpdatePersonTagDto,
  UpdatePersonTypeDto,
} from './dto/crm-config.dto';

@ApiTags('Person Types')
@ApiBearerAuth()
@Controller('person-types')
export class PersonTypeController {
  constructor(private readonly service: CrmConfigService) {}

  @Get() @RequirePermissions('person:read') list(@OrgId() o: string): Promise<PersonType[]> {
    return this.service.listPersonTypes(o);
  }
  @Post() @RequirePermissions('person_type:manage') create(
    @OrgId() o: string,
    @Body() dto: CreatePersonTypeDto,
    @CurrentUser('userId') a: string,
  ): Promise<PersonType> {
    return this.service.createPersonType(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('person_type:manage') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdatePersonTypeDto,
    @CurrentUser('userId') a: string,
  ): Promise<PersonType> {
    return this.service.updatePersonType(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('person_type:manage') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removePersonType(o, id, a);
  }
}

@ApiTags('Person Tags')
@ApiBearerAuth()
@Controller('person-tags')
export class PersonTagController {
  constructor(private readonly service: CrmConfigService) {}

  @Get() @RequirePermissions('person:read') list(@OrgId() o: string): Promise<PersonTag[]> {
    return this.service.listPersonTags(o);
  }
  @Post() @RequirePermissions('person_tag:manage') create(
    @OrgId() o: string,
    @Body() dto: CreatePersonTagDto,
    @CurrentUser('userId') a: string,
  ): Promise<PersonTag> {
    return this.service.createPersonTag(o, dto, a);
  }
  @Patch(':id') @RequirePermissions('person_tag:manage') update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdatePersonTagDto,
    @CurrentUser('userId') a: string,
  ): Promise<PersonTag> {
    return this.service.updatePersonTag(o, id, dto, a);
  }
  @Delete(':id') @HttpCode(204) @RequirePermissions('person_tag:manage') async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.removePersonTag(o, id, a);
  }
}
