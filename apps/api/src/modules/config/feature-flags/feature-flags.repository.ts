import { Injectable } from '@nestjs/common';
import { type FeatureFlag, type FeatureKey } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FeatureFlagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOrg(organizationId: string): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({
      where: { organizationId },
      orderBy: { feature: 'asc' },
    });
  }

  upsert(
    organizationId: string,
    feature: FeatureKey,
    isEnabled: boolean,
    actorId?: string,
  ): Promise<FeatureFlag> {
    return this.prisma.featureFlag.upsert({
      where: { organizationId_feature: { organizationId, feature } },
      create: { organizationId, feature, isEnabled, createdBy: actorId, updatedBy: actorId },
      update: { isEnabled, updatedBy: actorId },
    });
  }
}
