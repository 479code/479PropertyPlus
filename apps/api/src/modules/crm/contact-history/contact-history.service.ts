import { Injectable, NotFoundException } from '@nestjs/common';
import { type ContactHistoryEntry } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { PersonRepository } from '../person/person.repository';

import { ContactHistoryRepository } from './contact-history.repository';
import { type CreateContactHistoryDto } from './dto/contact-history.dto';

@Injectable()
export class ContactHistoryService {
  constructor(
    private readonly repository: ContactHistoryRepository,
    private readonly people: PersonRepository,
    private readonly audit: AuditService,
  ) {}

  private async ensurePerson(organizationId: string, personId: string): Promise<void> {
    if (!(await this.people.findById(organizationId, personId, true))) {
      throw new NotFoundException(`Person ${personId} not found`);
    }
  }

  async list(organizationId: string, personId: string): Promise<ContactHistoryEntry[]> {
    await this.ensurePerson(organizationId, personId);
    return this.repository.list(personId);
  }

  async create(
    organizationId: string,
    personId: string,
    dto: CreateContactHistoryDto,
    actorId?: string,
  ): Promise<ContactHistoryEntry> {
    await this.ensurePerson(organizationId, personId);
    const created = await this.repository.create(personId, {
      type: dto.type,
      subject: dto.subject,
      notes: dto.notes,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
      performedBy: actorId,
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'ContactHistoryEntry',
      entityId: created.id,
    });
    return created;
  }

  async remove(
    organizationId: string,
    personId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    await this.ensurePerson(organizationId, personId);
    const existing = await this.repository.findById(personId, id);
    if (!existing) throw new NotFoundException(`Contact history entry ${id} not found`);
    await this.repository.remove(id);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'ContactHistoryEntry',
      entityId: id,
    });
  }
}
