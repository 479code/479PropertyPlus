import { type Paginated } from '@479property/types';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Company } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CompanyService } from './company.service';
import { CreateCompanyDto, ListCompanyQueryDto, UpdateCompanyDto } from './dto/company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Post()
  @RequirePermissions('company:create')
  @ApiOperation({ summary: 'Create a company' })
  create(
    @OrgId() o: string,
    @Body() dto: CreateCompanyDto,
    @CurrentUser('userId') a: string,
  ): Promise<Company> {
    return this.service.create(o, dto, a);
  }

  @Get()
  @RequirePermissions('company:read')
  @ApiOperation({ summary: 'List companies' })
  list(@OrgId() o: string, @Query() q: ListCompanyQueryDto): Promise<Paginated<Company>> {
    return this.service.list(o, q);
  }

  @Get(':id')
  @RequirePermissions('company:read')
  @ApiOperation({ summary: 'Get a company' })
  get(@OrgId() o: string, @Param('id') id: string): Promise<Company> {
    return this.service.get(o, id);
  }

  @Patch(':id')
  @RequirePermissions('company:update')
  @ApiOperation({ summary: 'Update a company' })
  update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser('userId') a: string,
  ): Promise<Company> {
    return this.service.update(o, id, dto, a);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('company:delete')
  @ApiOperation({ summary: 'Delete a company' })
  async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.remove(o, id, a);
  }
}
