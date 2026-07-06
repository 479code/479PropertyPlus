import { Injectable } from '@nestjs/common';
import { type FeatureFlag, FeatureKey } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { OrganizationService } from '../../organization/organization.service';

import { FeatureFlagsRepository } from './feature-flags.repository';

export interface FeatureState {
  feature: FeatureKey;
  isEnabled: boolean;
}

@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly repository: FeatureFlagsRepository,
    private readonly organizations: OrganizationService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Return every known feature with its effective state for the organization.
   * Features without a stored row default to disabled, so the response is always
   * the complete, canonical set of toggles rather than only what has been set.
   */
  async list(organizationId: string): Promise<FeatureState[]> {
    await this.organizations.getOrThrow(organizationId);
    const stored = await this.repository.findByOrg(organizationId);
    const enabledByKey = new Map(stored.map((flag) => [flag.feature, flag.isEnabled]));
    return (Object.values(FeatureKey) as FeatureKey[]).map((feature) => ({
      feature,
      isEnabled: enabledByKey.get(feature) ?? false,
    }));
  }

  async setEnabled(
    organizationId: string,
    feature: FeatureKey,
    isEnabled: boolean,
    actorId?: string,
  ): Promise<FeatureFlag> {
    await this.organizations.getOrThrow(organizationId);
    const flag = await this.repository.upsert(organizationId, feature, isEnabled, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'FeatureFlag',
      entityId: flag.id,
      description: `Feature ${feature} ${isEnabled ? 'enabled' : 'disabled'}`,
    });
    return flag;
  }
}
