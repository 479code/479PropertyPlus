import { Injectable } from '@nestjs/common';
import { type PaymentSettings } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { OrganizationService } from '../../organization/organization.service';

import { type UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';
import { PaymentSettingsRepository } from './payment-settings.repository';

@Injectable()
export class PaymentSettingsService {
  constructor(
    private readonly repository: PaymentSettingsRepository,
    private readonly organizations: OrganizationService,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, actorId?: string): Promise<PaymentSettings> {
    await this.organizations.getOrThrow(organizationId);
    const existing = await this.repository.findByOrg(organizationId);
    return existing ?? this.repository.upsert(organizationId, {}, actorId);
  }

  async update(
    organizationId: string,
    dto: UpdatePaymentSettingsDto,
    actorId?: string,
  ): Promise<PaymentSettings> {
    await this.organizations.getOrThrow(organizationId);
    const settings = await this.repository.upsert(organizationId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'PaymentSettings',
      entityId: settings.id,
      changes: { ...dto },
    });
    return settings;
  }
}
