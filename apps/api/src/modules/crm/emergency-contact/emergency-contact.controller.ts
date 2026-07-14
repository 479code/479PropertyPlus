import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type EmergencyContact } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/emergency-contact.dto';
import { EmergencyContactService } from './emergency-contact.service';

@ApiTags('Emergency Contacts')
@ApiBearerAuth()
@Controller('people/:personId/emergency-contacts')
export class EmergencyContactController {
  constructor(private readonly service: EmergencyContactService) {}

  @Get()
  @RequirePermissions('person:read')
  @ApiOperation({ summary: "List a person's emergency contacts" })
  list(@OrgId() o: string, @Param('personId') personId: string): Promise<EmergencyContact[]> {
    return this.service.list(o, personId);
  }

  @Post()
  @RequirePermissions('emergency_contact:create')
  @ApiOperation({ summary: 'Add an emergency contact' })
  create(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Body() dto: CreateEmergencyContactDto,
    @CurrentUser('userId') a: string,
  ): Promise<EmergencyContact> {
    return this.service.create(o, personId, dto, a);
  }

  @Patch(':id')
  @RequirePermissions('emergency_contact:update')
  @ApiOperation({ summary: 'Update an emergency contact' })
  update(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyContactDto,
    @CurrentUser('userId') a: string,
  ): Promise<EmergencyContact> {
    return this.service.update(o, personId, id, dto, a);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions('emergency_contact:delete')
  @ApiOperation({ summary: 'Remove an emergency contact' })
  async remove(
    @OrgId() o: string,
    @Param('personId') personId: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.remove(o, personId, id, a);
  }
}
