import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type PersonDocument } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CreatePersonDocumentDto, UpdatePersonDocumentDto } from './dto/person-document.dto';
import { PersonDocumentService } from './person-document.service';

@ApiTags('Person Documents')
@ApiBearerAuth()
@Controller('people/:personId/documents')
export class PersonDocumentController {
  constructor(private readonly service: PersonDocumentService) {}

  @Get()
  @RequirePermissions('person:read')
  @ApiOperation({ summary: "List a person's documents" })
  list(@OrgId() o: string, @Param('personId') personId: string): Promise<PersonDocument[]> {
    return this.service.list(o, personId);
  }

  @Post()
  @RequirePermissions('person_document:create')
  @ApiOperation({ summary: 'Add a document (metadata only)' })
  create(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: CreatePersonDocumentDto,
    @CurrentUser('userId') a: string,
  ): Promise<PersonDocument> {
    return this.service.create(o, personId, dto, a);
  }

  @Patch(':id')
  @RequirePermissions('person_document:update')
  @ApiOperation({ summary: 'Update a document' })
  update(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePersonDocumentDto,
    @CurrentUser('userId') a: string,
  ): Promise<PersonDocument> {
    return this.service.update(o, personId, id, dto, a);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('person_document:delete')
  @ApiOperation({ summary: 'Remove a document' })
  async remove(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.remove(o, personId, id, a);
  }
}
