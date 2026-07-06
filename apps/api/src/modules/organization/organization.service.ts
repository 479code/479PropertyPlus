import { type Paginated } from '@479property/types';
import { paginate } from '@479property/utils';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type Organization } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AuditService } from '../audit/audit.service';

import { type CreateOrganizationDto } from './dto/create-organization.dto';
import { type UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationRepository } from './organization.repository';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class OrganizationService {
  constructor(
    private readonly repository: OrganizationRepository,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateOrganizationDto, actorId?: string): Promise<Organization> {
    const slug = dto.slug ?? slugify(dto.name);
    const existing = await this.repository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`An organization with slug "${slug}" already exists`);
    }
    const organization = await this.repository.create({ name: dto.name, slug, createdBy: actorId });
    await this.audit.record({
      organizationId: organization.id,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Organization',
      entityId: organization.id,
      description: `Organization "${organization.name}" created`,
    });
    return organization;
  }

  async list(query: PaginationQueryDto): Promise<Paginated<Organization>> {
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.repository.findManyAndCount(skip, query.pageSize);
    return paginate(items, total, { page: query.page, pageSize: query.pageSize });
  }

  async getOrThrow(id: string): Promise<Organization> {
    const organization = await this.repository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    return organization;
  }

  async update(id: string, dto: UpdateOrganizationDto, actorId?: string): Promise<Organization> {
    await this.getOrThrow(id);
    const organization = await this.repository.update(id, { ...dto, updatedBy: actorId });
    await this.audit.record({
      organizationId: id,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Organization',
      entityId: id,
      changes: { ...dto },
    });
    return organization;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    await this.getOrThrow(id);
    await this.repository.softDelete(id, actorId);
    await this.audit.record({
      organizationId: id,
      userId: actorId,
      action: 'DELETE',
      entityType: 'Organization',
      entityId: id,
    });
  }
}
