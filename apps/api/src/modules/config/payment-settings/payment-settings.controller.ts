import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type PaymentSettings } from '@prisma/client';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { ActorId, OrgId } from '../../../common/tenant/tenant.decorators';

import { UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';
import { PaymentSettingsService } from './payment-settings.service';

@ApiTags('Payment Settings')
@Controller('config/payment-settings')
@ApiBearerAuth()
@RequirePermissions('configuration:read')
export class PaymentSettingsController {
  constructor(private readonly service: PaymentSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get payment settings' })
  get(@OrgId() organizationId: string, @ActorId() actorId?: string): Promise<PaymentSettings> {
    return this.service.get(organizationId, actorId);
  }

  @RequirePermissions('configuration:update')
  @Put()
  @ApiOperation({ summary: 'Update payment settings' })
  update(
    @OrgId() organizationId: string,
    @Body() dto: UpdatePaymentSettingsDto,
    @ActorId() actorId?: string,
  ): Promise<PaymentSettings> {
    return this.service.update(organizationId, dto, actorId);
  }
}
