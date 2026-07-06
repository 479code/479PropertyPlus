import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type NumberedEntity, type NumberingSequence } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { OrganizationService } from '../../organization/organization.service';

import { type CreateNumberingSequenceDto } from './dto/create-numbering-sequence.dto';
import { type UpdateNumberingSequenceDto } from './dto/update-numbering-sequence.dto';
import { NumberingRepository } from './numbering.repository';

@Injectable()
export class NumberingService {
  constructor(
    private readonly repository: NumberingRepository,
    private readonly organizations: OrganizationService,
    private readonly audit: AuditService,
  ) {}

  async list(organizationId: string): Promise<NumberingSequence[]> {
    await this.organizations.getOrThrow(organizationId);
    return this.repository.findByOrg(organizationId);
  }

  async getOrThrow(organizationId: string, entity: NumberedEntity): Promise<NumberingSequence> {
    const sequence = await this.repository.findByEntity(organizationId, entity);
    if (!sequence) {
      throw new NotFoundException(`No numbering sequence configured for ${entity}`);
    }
    return sequence;
  }

  async create(
    organizationId: string,
    dto: CreateNumberingSequenceDto,
    actorId?: string,
  ): Promise<NumberingSequence> {
    await this.organizations.getOrThrow(organizationId);
    const existing = await this.repository.findByEntity(organizationId, dto.entity);
    if (existing) {
      throw new ConflictException(`A numbering sequence for ${dto.entity} already exists`);
    }
    const sequence = await this.repository.create(organizationId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'NumberingSequence',
      entityId: sequence.id,
      changes: { ...dto },
    });
    return sequence;
  }

  async update(
    organizationId: string,
    entity: NumberedEntity,
    dto: UpdateNumberingSequenceDto,
    actorId?: string,
  ): Promise<NumberingSequence> {
    const existing = await this.getOrThrow(organizationId, entity);
    const sequence = await this.repository.update(existing.id, { ...dto, updatedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'NumberingSequence',
      entityId: existing.id,
      changes: { ...dto },
    });
    return sequence;
  }
}
