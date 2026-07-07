import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  type PropertyFeature,
  type PropertyStatus,
  type PropertyTag,
  type PropertyType,
} from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

import {
  DEFAULT_PROPERTY_FEATURES,
  DEFAULT_PROPERTY_STATUSES,
  DEFAULT_PROPERTY_TAGS,
  DEFAULT_PROPERTY_TYPES,
} from './default-property-config';
import {
  type CreatePropertyFeatureDto,
  type CreatePropertyStatusDto,
  type CreatePropertyTagDto,
  type CreatePropertyTypeDto,
  type UpdatePropertyFeatureDto,
  type UpdatePropertyStatusDto,
  type UpdatePropertyTagDto,
  type UpdatePropertyTypeDto,
} from './dto/property-config.dto';
import { PropertyConfigRepository } from './property-config.repository';

@Injectable()
export class PropertyConfigService {
  constructor(
    private readonly repository: PropertyConfigRepository,
    private readonly audit: AuditService,
  ) {}

  private record(
    organizationId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    actorId?: string,
  ): Promise<void> {
    return this.audit.record({ organizationId, userId: actorId, action, entityType, entityId });
  }

  // ── Types ──
  listTypes(organizationId: string): Promise<PropertyType[]> {
    return this.repository.listTypes(organizationId);
  }
  async getType(organizationId: string, id: string): Promise<PropertyType> {
    const found = await this.repository.findType(organizationId, id);
    if (!found) throw new NotFoundException(`Property type ${id} not found`);
    return found;
  }
  async createType(
    organizationId: string,
    dto: CreatePropertyTypeDto,
    actorId?: string,
  ): Promise<PropertyType> {
    if (await this.repository.findTypeByName(organizationId, dto.name)) {
      throw new ConflictException(`Property type "${dto.name}" already exists`);
    }
    const created = await this.repository.createType(organizationId, { ...dto }, actorId);
    await this.record(organizationId, 'CREATE', 'PropertyType', created.id, actorId);
    return created;
  }
  async updateType(
    organizationId: string,
    id: string,
    dto: UpdatePropertyTypeDto,
    actorId?: string,
  ): Promise<PropertyType> {
    await this.getType(organizationId, id);
    const updated = await this.repository.updateType(id, { ...dto }, actorId);
    await this.record(organizationId, 'UPDATE', 'PropertyType', id, actorId);
    return updated;
  }
  async removeType(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.getType(organizationId, id);
    await this.repository.softDeleteType(id, actorId);
    await this.record(organizationId, 'DELETE', 'PropertyType', id, actorId);
  }

  // ── Statuses ──
  listStatuses(organizationId: string): Promise<PropertyStatus[]> {
    return this.repository.listStatuses(organizationId);
  }
  async getStatus(organizationId: string, id: string): Promise<PropertyStatus> {
    const found = await this.repository.findStatus(organizationId, id);
    if (!found) throw new NotFoundException(`Property status ${id} not found`);
    return found;
  }
  async createStatus(
    organizationId: string,
    dto: CreatePropertyStatusDto,
    actorId?: string,
  ): Promise<PropertyStatus> {
    if (await this.repository.findStatusByName(organizationId, dto.name)) {
      throw new ConflictException(`Property status "${dto.name}" already exists`);
    }
    const created = await this.repository.createStatus(organizationId, { ...dto }, actorId);
    await this.record(organizationId, 'CREATE', 'PropertyStatus', created.id, actorId);
    return created;
  }
  async updateStatus(
    organizationId: string,
    id: string,
    dto: UpdatePropertyStatusDto,
    actorId?: string,
  ): Promise<PropertyStatus> {
    await this.getStatus(organizationId, id);
    const updated = await this.repository.updateStatus(id, { ...dto }, actorId);
    await this.record(organizationId, 'UPDATE', 'PropertyStatus', id, actorId);
    return updated;
  }
  async removeStatus(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.getStatus(organizationId, id);
    await this.repository.softDeleteStatus(id, actorId);
    await this.record(organizationId, 'DELETE', 'PropertyStatus', id, actorId);
  }

  // ── Features ──
  listFeatures(organizationId: string): Promise<PropertyFeature[]> {
    return this.repository.listFeatures(organizationId);
  }
  async getFeature(organizationId: string, id: string): Promise<PropertyFeature> {
    const found = await this.repository.findFeature(organizationId, id);
    if (!found) throw new NotFoundException(`Property feature ${id} not found`);
    return found;
  }
  async createFeature(
    organizationId: string,
    dto: CreatePropertyFeatureDto,
    actorId?: string,
  ): Promise<PropertyFeature> {
    if (await this.repository.findFeatureByName(organizationId, dto.name)) {
      throw new ConflictException(`Property feature "${dto.name}" already exists`);
    }
    const created = await this.repository.createFeature(organizationId, { ...dto }, actorId);
    await this.record(organizationId, 'CREATE', 'PropertyFeature', created.id, actorId);
    return created;
  }
  async updateFeature(
    organizationId: string,
    id: string,
    dto: UpdatePropertyFeatureDto,
    actorId?: string,
  ): Promise<PropertyFeature> {
    await this.getFeature(organizationId, id);
    const updated = await this.repository.updateFeature(id, { ...dto }, actorId);
    await this.record(organizationId, 'UPDATE', 'PropertyFeature', id, actorId);
    return updated;
  }
  async removeFeature(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.getFeature(organizationId, id);
    await this.repository.softDeleteFeature(id, actorId);
    await this.record(organizationId, 'DELETE', 'PropertyFeature', id, actorId);
  }

  // ── Tags ──
  listTags(organizationId: string): Promise<PropertyTag[]> {
    return this.repository.listTags(organizationId);
  }
  async getTag(organizationId: string, id: string): Promise<PropertyTag> {
    const found = await this.repository.findTag(organizationId, id);
    if (!found) throw new NotFoundException(`Property tag ${id} not found`);
    return found;
  }
  async createTag(
    organizationId: string,
    dto: CreatePropertyTagDto,
    actorId?: string,
  ): Promise<PropertyTag> {
    if (await this.repository.findTagByName(organizationId, dto.name)) {
      throw new ConflictException(`Property tag "${dto.name}" already exists`);
    }
    const created = await this.repository.createTag(organizationId, { ...dto }, actorId);
    await this.record(organizationId, 'CREATE', 'PropertyTag', created.id, actorId);
    return created;
  }
  async updateTag(
    organizationId: string,
    id: string,
    dto: UpdatePropertyTagDto,
    actorId?: string,
  ): Promise<PropertyTag> {
    await this.getTag(organizationId, id);
    const updated = await this.repository.updateTag(id, { ...dto }, actorId);
    await this.record(organizationId, 'UPDATE', 'PropertyTag', id, actorId);
    return updated;
  }
  async removeTag(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.getTag(organizationId, id);
    await this.repository.softDeleteTag(id, actorId);
    await this.record(organizationId, 'DELETE', 'PropertyTag', id, actorId);
  }

  /**
   * Seed the default property configuration for a new organization. Runs inside
   * the signup transaction (accepts the tx client) so onboarding stays atomic.
   */
  async seedDefaults(db: PrismaDb, organizationId: string, actorId?: string): Promise<void> {
    await Promise.all([
      ...DEFAULT_PROPERTY_TYPES.map((name, i) =>
        this.repository.createType(organizationId, { name, displayOrder: i }, actorId, db),
      ),
      ...DEFAULT_PROPERTY_STATUSES.map((s, i) =>
        this.repository.createStatus(
          organizationId,
          { name: s.name, color: s.color, displayOrder: i },
          actorId,
          db,
        ),
      ),
      ...DEFAULT_PROPERTY_FEATURES.map((name, i) =>
        this.repository.createFeature(organizationId, { name, displayOrder: i }, actorId, db),
      ),
      ...DEFAULT_PROPERTY_TAGS.map((t) =>
        this.repository.createTag(organizationId, { name: t.name, color: t.color }, actorId, db),
      ),
    ]);
  }
}
