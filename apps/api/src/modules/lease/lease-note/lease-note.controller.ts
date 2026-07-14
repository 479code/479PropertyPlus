import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type LeaseNote } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateLeaseNoteDto } from './dto/lease-note.dto';
import { LeaseNoteService } from './lease-note.service';

@ApiTags('Lease Notes')
@ApiBearerAuth()
@Controller('leases/:leaseId/notes')
export class LeaseNoteController {
  constructor(private readonly service: LeaseNoteService) {}

  @Get() @RequirePermissions('lease:read') list(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
  ): Promise<LeaseNote[]> {
    return this.service.list(o, leaseId);
  }

  @Post() @RequirePermissions('lease_note:create') create(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Body() dto: CreateLeaseNoteDto,
    @CurrentUser('userId') a: string,
  ): Promise<LeaseNote> {
    return this.service.create(o, leaseId, dto.note, a);
  }

  @Delete(':id') @HttpCode(204) @RequirePermissions('lease_note:create') async remove(
    @OrgId() o: string,
    @Param('leaseId') leaseId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.remove(o, leaseId, id);
  }
}
