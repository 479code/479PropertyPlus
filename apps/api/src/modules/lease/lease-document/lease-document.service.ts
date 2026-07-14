import { Injectable, NotFoundException } from '@nestjs/common';
import { type LeaseDocument } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { LeaseRepository } from '../lease/lease.repository';

import { type CreateLeaseDocumentDto, type UpdateLeaseDocumentDto } from './dto/lease-document.dto';
import { LeaseDocumentRepository } from './lease-document.repository';

@Injectable()
export class LeaseDocumentService {
  constructor(
    private readonly repository: LeaseDocumentRepository,
    private readonly leases: LeaseRepository,
    private readonly audit: AuditService,
  ) {}

  private async ensureLease(organizationId: string, leaseId: string): Promise<void> {
    if (!(await this.leases.findById(organizationId, leaseId, true))) {
      throw new NotFoundException(`Lease ${leaseId} not found`);
    }
  }

  async list(organizationId: string, leaseId: string): Promise<LeaseDocument[]> {
    await this.ensureLease(organizationId, leaseId);
    return this.repository.list(leaseId);
  }

  async create(
    organizationId: string,
    leaseId: string,
    dto: CreateLeaseDocumentDto,
    actorId?: string,
  ): Promise<LeaseDocument> {
    await this.ensureLease(organizationId, leaseId);
    const created = await this.repository.create(leaseId, { ...dto, uploadedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'LeaseDocument',
      entityId: created.id,
    });
    return created;
  }

  async update(
    organizationId: string,
    leaseId: string,
    id: string,
    dto: UpdateLeaseDocumentDto,
    actorId?: string,
  ): Promise<LeaseDocument> {
    await this.ensureLease(organizationId, leaseId);
    if (!(await this.repository.findById(leaseId, id)))
      throw new NotFoundException(`Document ${id} not found`);
    const updated = await this.repository.update(id, dto);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'LeaseDocument',
      entityId: id,
    });
    return updated;
  }

  async remove(
    organizationId: string,
    leaseId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    await this.ensureLease(organizationId, leaseId);
    if (!(await this.repository.findById(leaseId, id)))
      throw new NotFoundException(`Document ${id} not found`);
    await this.repository.remove(id);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'LeaseDocument',
      entityId: id,
    });
  }
}
