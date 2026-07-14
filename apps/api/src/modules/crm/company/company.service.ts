import { type Paginated } from '@479property/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { type Company } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';

import { CompanyRepository } from './company.repository';
import {
  type CreateCompanyDto,
  type ListCompanyQueryDto,
  type UpdateCompanyDto,
} from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly repository: CompanyRepository,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, id: string): Promise<Company> {
    const company = await this.repository.findById(organizationId, id);
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }

  async list(organizationId: string, query: ListCompanyQueryDto): Promise<Paginated<Company>> {
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.repository.list(
      organizationId,
      query.name,
      skip,
      query.pageSize,
    );
    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      pageCount: Math.max(Math.ceil(total / query.pageSize), 1),
    };
  }

  async create(organizationId: string, dto: CreateCompanyDto, actorId?: string): Promise<Company> {
    const created = await this.repository.create({
      organizationId,
      ...dto,
      createdBy: actorId,
      updatedBy: actorId,
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Company',
      entityId: created.id,
    });
    return created;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateCompanyDto,
    actorId?: string,
  ): Promise<Company> {
    await this.get(organizationId, id);
    const updated = await this.repository.update(id, { ...dto, updatedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Company',
      entityId: id,
    });
    return updated;
  }

  async remove(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.get(organizationId, id);
    await this.repository.softDelete(id, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'Company',
      entityId: id,
    });
  }
}
