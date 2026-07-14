import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type ContactHistoryEntry } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { ContactHistoryService } from './contact-history.service';
import { CreateContactHistoryDto } from './dto/contact-history.dto';

@ApiTags('Contact History')
@ApiBearerAuth()
@Controller('people/:personId/contact-history')
export class ContactHistoryController {
  constructor(private readonly service: ContactHistoryService) {}

  @Get()
  @RequirePermissions('contact_history:read')
  @ApiOperation({ summary: "List a person's contact history timeline" })
  list(@OrgId() o: string, @Param('personId') personId: string): Promise<ContactHistoryEntry[]> {
    return this.service.list(o, personId);
  }

  @Post()
  @RequirePermissions('contact_history:create')
  @ApiOperation({ summary: 'Log a contact history entry' })
  create(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: CreateContactHistoryDto,
    @CurrentUser('userId') a: string,
  ): Promise<ContactHistoryEntry> {
    return this.service.create(o, personId, dto, a);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('contact_history:delete')
  @ApiOperation({ summary: 'Delete a contact history entry' })
  async remove(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.remove(o, personId, id, a);
  }
}
