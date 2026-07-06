import { Injectable } from '@nestjs/common';
import { type PaymentSettings } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { type UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';

@Injectable()
export class PaymentSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOrg(organizationId: string): Promise<PaymentSettings | null> {
    return this.prisma.paymentSettings.findUnique({ where: { organizationId } });
  }

  upsert(
    organizationId: string,
    data: UpdatePaymentSettingsDto,
    actorId?: string,
  ): Promise<PaymentSettings> {
    return this.prisma.paymentSettings.upsert({
      where: { organizationId },
      create: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
      update: { ...data, updatedBy: actorId },
    });
  }
}
