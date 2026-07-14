import { Injectable, NotFoundException } from '@nestjs/common';
import { type PersonDocument } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { PersonRepository } from '../person/person.repository';

import {
  type CreatePersonDocumentDto,
  type UpdatePersonDocumentDto,
} from './dto/person-document.dto';
import { PersonDocumentRepository } from './person-document.repository';

@Injectable()
export class PersonDocumentService {
  constructor(
    private readonly repository: PersonDocumentRepository,
    private readonly people: PersonRepository,
    private readonly audit: AuditService,
  ) {}

  private async ensurePerson(organizationId: string, personId: string): Promise<void> {
    if (!(await this.people.findById(organizationId, personId, true))) {
      throw new NotFoundException(`Person ${personId} not found`);
    }
  }

  async list(organizationId: string, personId: string): Promise<PersonDocument[]> {
    await this.ensurePerson(organizationId, personId);
    return this.repository.list(personId);
  }

  async create(
    organizationId: string,
    personId: string,
    dto: CreatePersonDocumentDto,
    actorId?: string,
  ): Promise<PersonDocument> {
    await this.ensurePerson(organizationId, personId);
    const created = await this.repository.create(personId, { ...dto, uploadedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'PersonDocument',
      entityId: created.id,
    });
    return created;
  }

  async update(
    organizationId: string,
    personId: string,
    id: string,
    dto: UpdatePersonDocumentDto,
    actorId?: string,
  ): Promise<PersonDocument> {
    await this.ensurePerson(organizationId, personId);
    const existing = await this.repository.findById(personId, id);
    if (!existing) throw new NotFoundException(`Document ${id} not found`);
    const updated = await this.repository.update(id, dto);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'PersonDocument',
      entityId: id,
    });
    return updated;
  }

  async remove(
    organizationId: string,
    personId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    await this.ensurePerson(organizationId, personId);
    const existing = await this.repository.findById(personId, id);
    if (!existing) throw new NotFoundException(`Document ${id} not found`);
    await this.repository.remove(id);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'PersonDocument',
      entityId: id,
    });
  }
}
