import { Injectable } from '@nestjs/common';
import { type LeaseSettings } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { type UpdateLeaseSettingsDto } from './dto/update-lease-settings.dto';

@Injectable()
export class LeaseSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOrg(organizationId: string): Promise<LeaseSettings | null> {
    return this.prisma.leaseSettings.findUnique({ where: { organizationId } });
  }

  upsert(
    organizationId: string,
    data: UpdateLeaseSettingsDto,
    actorId?: string,
  ): Promise<LeaseSettings> {
    return this.prisma.leaseSettings.upsert({
      where: { organizationId },
      create: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
      update: { ...data, updatedBy: actorId },
    });
  }
}
