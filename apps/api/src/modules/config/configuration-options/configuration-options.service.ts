import { type Paginated } from '@479property/types';
import { paginate } from '@479property/utils';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type ConfigurationOption } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';

import { ConfigurationOptionsRepository } from './configuration-options.repository';
import { type CreateConfigurationOptionDto } from './dto/create-configuration-option.dto';
import { type QueryConfigurationOptionDto } from './dto/query-configuration-option.dto';
import { type UpdateConfigurationOptionDto } from './dto/update-configuration-option.dto';

@Injectable()
export class ConfigurationOptionsService {
  constructor(
    private readonly repository: ConfigurationOptionsRepository,
    private readonly audit: AuditService,
  ) {}

  async create(
    organizationId: string,
    dto: CreateConfigurationOptionDto,
    actorId?: string,
  ): Promise<ConfigurationOption> {
    const existing = await this.repository.findByKey(organizationId, dto.category, dto.key);
    if (existing) {
      throw new ConflictException(`Option "${dto.key}" already exists in category ${dto.category}`);
    }
    const option = await this.repository.create({ organizationId, ...dto, createdBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'ConfigurationOption',
      entityId: option.id,
      description: `Created ${dto.category} option "${dto.key}"`,
    });
    return option;
  }

  async list(
    organizationId: string,
    query: QueryConfigurationOptionDto,
  ): Promise<Paginated<ConfigurationOption>> {
    const where: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.category) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.repository.findManyAndCount(where, skip, query.pageSize);
    return paginate(items, total, { page: query.page, pageSize: query.pageSize });
  }

  async getOrThrow(organizationId: string, id: string): Promise<ConfigurationOption> {
    const option = await this.repository.findById(organizationId, id);
    if (!option) {
      throw new NotFoundException(`Configuration option ${id} not found`);
    }
    return option;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateConfigurationOptionDto,
    actorId?: string,
  ): Promise<ConfigurationOption> {
    await this.getOrThrow(organizationId, id);
    const option = await this.repository.update(id, { ...dto, updatedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'ConfigurationOption',
      entityId: id,
      changes: { ...dto },
    });
    return option;
  }

  async remove(organizationId: string, id: string, actorId?: string): Promise<void> {
    const option = await this.getOrThrow(organizationId, id);
    if (option.isSystem) {
      throw new ConflictException('System-defined options cannot be deleted');
    }
    await this.repository.softDelete(id, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'ConfigurationOption',
      entityId: id,
    });
  }
}
