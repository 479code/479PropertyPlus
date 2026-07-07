import { Body, Controller, Get, Param, ParseEnumPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type FeatureFlag, FeatureKey } from '@prisma/client';

import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { ActorId, OrgId } from '../../../common/tenant/tenant.decorators';

import { UpsertFeatureFlagDto } from './dto/upsert-feature-flag.dto';
import { type FeatureState, FeatureFlagsService } from './feature-flags.service';

@ApiTags('Feature Flags')
@Controller('config/feature-flags')
@ApiBearerAuth()
@RequirePermissions('configuration:read')
export class FeatureFlagsController {
  constructor(private readonly service: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'List every feature and its enabled state' })
  list(@OrgId() organizationId: string): Promise<FeatureState[]> {
    return this.service.list(organizationId);
  }

  @RequirePermissions('configuration:update')
  @Put(':feature')
  @ApiOperation({ summary: 'Enable or disable a feature for the organization' })
  set(
    @OrgId() organizationId: string,
    @Param('feature', new ParseEnumPipe(FeatureKey)) feature: FeatureKey,
    @Body() dto: UpsertFeatureFlagDto,
    @ActorId() actorId?: string,
  ): Promise<FeatureFlag> {
    return this.service.setEnabled(organizationId, feature, dto.isEnabled, actorId);
  }
}
