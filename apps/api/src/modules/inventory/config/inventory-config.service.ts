import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import {
  type BuildingStatus,
  type UnitFeature,
  type UnitStatus,
  type UnitType,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

import {
  DEFAULT_BUILDING_STATUSES,
  DEFAULT_UNIT_FEATURES,
  DEFAULT_UNIT_STATUSES,
  DEFAULT_UNIT_TYPES,
} from './default-inventory-config';
import {
  type CreateBuildingStatusDto,
  type CreateUnitFeatureDto,
  type CreateUnitStatusDto,
  type CreateUnitTypeDto,
  type UpdateBuildingStatusDto,
  type UpdateUnitFeatureDto,
  type UpdateUnitStatusDto,
  type UpdateUnitTypeDto,
} from './dto/inventory-config.dto';
import { InventoryConfigRepository } from './inventory-config.repository';

@Injectable()
export class InventoryConfigService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InventoryConfigService.name);

  constructor(
    private readonly repository: InventoryConfigRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.backfillAll();
    } catch (error) {
      this.logger.error('Inventory config backfill failed', error as Error);
    }
  }

  private rec(
    organizationId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    actorId?: string,
  ): Promise<void> {
    return this.audit.record({ organizationId, userId: actorId, action, entityType, entityId });
  }

  // ── BuildingStatus ──
  listBuildingStatuses(orgId: string): Promise<BuildingStatus[]> {
    return this.repository.listBuildingStatuses(orgId);
  }
  async getBuildingStatus(orgId: string, id: string): Promise<BuildingStatus> {
    const f = await this.repository.findBuildingStatus(orgId, id);
    if (!f) throw new NotFoundException(`Building status ${id} not found`);
    return f;
  }
  async createBuildingStatus(
    orgId: string,
    dto: CreateBuildingStatusDto,
    actorId?: string,
  ): Promise<BuildingStatus> {
    if (await this.repository.findBuildingStatusByName(orgId, dto.name))
      throw new ConflictException(`Building status "${dto.name}" already exists`);
    const created = await this.repository.createBuildingStatus(orgId, dto, actorId);
    await this.rec(orgId, 'CREATE', 'BuildingStatus', created.id, actorId);
    return created;
  }
  async updateBuildingStatus(
    orgId: string,
    id: string,
    dto: UpdateBuildingStatusDto,
    actorId?: string,
  ): Promise<BuildingStatus> {
    await this.getBuildingStatus(orgId, id);
    const updated = await this.repository.updateBuildingStatus(id, dto, actorId);
    await this.rec(orgId, 'UPDATE', 'BuildingStatus', id, actorId);
    return updated;
  }
  async removeBuildingStatus(orgId: string, id: string, actorId?: string): Promise<void> {
    await this.getBuildingStatus(orgId, id);
    await this.repository.softDeleteBuildingStatus(id, actorId);
    await this.rec(orgId, 'DELETE', 'BuildingStatus', id, actorId);
  }

  // ── UnitType ──
  listUnitTypes(orgId: string): Promise<UnitType[]> {
    return this.repository.listUnitTypes(orgId);
  }
  async getUnitType(orgId: string, id: string): Promise<UnitType> {
    const f = await this.repository.findUnitType(orgId, id);
    if (!f) throw new NotFoundException(`Unit type ${id} not found`);
    return f;
  }
  async createUnitType(orgId: string, dto: CreateUnitTypeDto, actorId?: string): Promise<UnitType> {
    if (await this.repository.findUnitTypeByName(orgId, dto.name))
      throw new ConflictException(`Unit type "${dto.name}" already exists`);
    const created = await this.repository.createUnitType(orgId, dto, actorId);
    await this.rec(orgId, 'CREATE', 'UnitType', created.id, actorId);
    return created;
  }
  async updateUnitType(
    orgId: string,
    id: string,
    dto: UpdateUnitTypeDto,
    actorId?: string,
  ): Promise<UnitType> {
    await this.getUnitType(orgId, id);
    const updated = await this.repository.updateUnitType(id, dto, actorId);
    await this.rec(orgId, 'UPDATE', 'UnitType', id, actorId);
    return updated;
  }
  async removeUnitType(orgId: string, id: string, actorId?: string): Promise<void> {
    await this.getUnitType(orgId, id);
    await this.repository.softDeleteUnitType(id, actorId);
    await this.rec(orgId, 'DELETE', 'UnitType', id, actorId);
  }

  // ── UnitStatus ──
  listUnitStatuses(orgId: string): Promise<UnitStatus[]> {
    return this.repository.listUnitStatuses(orgId);
  }
  async getUnitStatus(orgId: string, id: string): Promise<UnitStatus> {
    const f = await this.repository.findUnitStatus(orgId, id);
    if (!f) throw new NotFoundException(`Unit status ${id} not found`);
    return f;
  }
  async createUnitStatus(
    orgId: string,
    dto: CreateUnitStatusDto,
    actorId?: string,
  ): Promise<UnitStatus> {
    if (await this.repository.findUnitStatusByName(orgId, dto.name))
      throw new ConflictException(`Unit status "${dto.name}" already exists`);
    const created = await this.repository.createUnitStatus(orgId, dto, actorId);
    await this.rec(orgId, 'CREATE', 'UnitStatus', created.id, actorId);
    return created;
  }
  async updateUnitStatus(
    orgId: string,
    id: string,
    dto: UpdateUnitStatusDto,
    actorId?: string,
  ): Promise<UnitStatus> {
    await this.getUnitStatus(orgId, id);
    const updated = await this.repository.updateUnitStatus(id, dto, actorId);
    await this.rec(orgId, 'UPDATE', 'UnitStatus', id, actorId);
    return updated;
  }
  async removeUnitStatus(orgId: string, id: string, actorId?: string): Promise<void> {
    await this.getUnitStatus(orgId, id);
    await this.repository.softDeleteUnitStatus(id, actorId);
    await this.rec(orgId, 'DELETE', 'UnitStatus', id, actorId);
  }

  // ── UnitFeature ──
  listUnitFeatures(orgId: string): Promise<UnitFeature[]> {
    return this.repository.listUnitFeatures(orgId);
  }
  async getUnitFeature(orgId: string, id: string): Promise<UnitFeature> {
    const f = await this.repository.findUnitFeature(orgId, id);
    if (!f) throw new NotFoundException(`Unit feature ${id} not found`);
    return f;
  }
  async createUnitFeature(
    orgId: string,
    dto: CreateUnitFeatureDto,
    actorId?: string,
  ): Promise<UnitFeature> {
    if (await this.repository.findUnitFeatureByName(orgId, dto.name))
      throw new ConflictException(`Unit feature "${dto.name}" already exists`);
    const created = await this.repository.createUnitFeature(orgId, dto, actorId);
    await this.rec(orgId, 'CREATE', 'UnitFeature', created.id, actorId);
    return created;
  }
  async updateUnitFeature(
    orgId: string,
    id: string,
    dto: UpdateUnitFeatureDto,
    actorId?: string,
  ): Promise<UnitFeature> {
    await this.getUnitFeature(orgId, id);
    const updated = await this.repository.updateUnitFeature(id, dto, actorId);
    await this.rec(orgId, 'UPDATE', 'UnitFeature', id, actorId);
    return updated;
  }
  async removeUnitFeature(orgId: string, id: string, actorId?: string): Promise<void> {
    await this.getUnitFeature(orgId, id);
    await this.repository.softDeleteUnitFeature(id, actorId);
    await this.rec(orgId, 'DELETE', 'UnitFeature', id, actorId);
  }

  /**
   * Seed defaults for one organization. Only seeds categories that are currently
   * empty, so it is safe to run at signup AND as an idempotent backfill.
   */
  async seedDefaults(db: PrismaDb, organizationId: string, actorId?: string): Promise<void> {
    const [statuses, types, unitStatuses, features] = await Promise.all([
      this.repository.countBuildingStatuses(organizationId),
      this.repository.countUnitTypes(organizationId),
      this.repository.countUnitStatuses(organizationId),
      this.repository.countUnitFeatures(organizationId),
    ]);

    const work: Array<Promise<unknown>> = [];
    if (statuses === 0)
      DEFAULT_BUILDING_STATUSES.forEach((s, i) =>
        work.push(
          this.repository.createBuildingStatus(
            organizationId,
            { name: s.name, color: s.color, displayOrder: i },
            actorId,
            db,
          ),
        ),
      );
    if (types === 0)
      DEFAULT_UNIT_TYPES.forEach((name, i) =>
        work.push(
          this.repository.createUnitType(organizationId, { name, displayOrder: i }, actorId, db),
        ),
      );
    if (unitStatuses === 0)
      DEFAULT_UNIT_STATUSES.forEach((s, i) =>
        work.push(
          this.repository.createUnitStatus(
            organizationId,
            { name: s.name, color: s.color, displayOrder: i },
            actorId,
            db,
          ),
        ),
      );
    if (features === 0)
      DEFAULT_UNIT_FEATURES.forEach((name, i) =>
        work.push(
          this.repository.createUnitFeature(organizationId, { name, displayOrder: i }, actorId, db),
        ),
      );
    await Promise.all(work);
  }

  /** Seed missing inventory config for every existing organization. Safe to run repeatedly. */
  async backfillAll(): Promise<void> {
    const orgs = await this.repository.listOrganizationIds();
    let seeded = 0;
    for (const org of orgs) {
      const before = await this.repository.countUnitTypes(org.id);
      await this.seedDefaults(this.prisma, org.id);
      if (before === 0) seeded += 1;
    }
    if (seeded > 0) this.logger.log(`Inventory config backfilled for ${seeded} organization(s)`);
  }
}
