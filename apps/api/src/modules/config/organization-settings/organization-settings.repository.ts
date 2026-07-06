import { Injectable } from '@nestjs/common';
import { type OrganizationSettings } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { type UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';

@Injectable()
export class OrganizationSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOrg(organizationId: string): Promise<OrganizationSettings | null> {
    return this.prisma.organizationSettings.findUnique({ where: { organizationId } });
  }

  upsert(
    organizationId: string,
    data: UpdateOrganizationSettingsDto,
    actorId?: string,
  ): Promise<OrganizationSettings> {
    return this.prisma.organizationSettings.upsert({
      where: { organizationId },
      create: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
      update: { ...data, updatedBy: actorId },
    });
  }
}
