import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type EmergencyContact } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { PersonRepository } from '../person/person.repository';

import {
  type CreateEmergencyContactDto,
  type UpdateEmergencyContactDto,
} from './dto/emergency-contact.dto';
import { EmergencyContactRepository } from './emergency-contact.repository';

@Injectable()
export class EmergencyContactService {
  constructor(
    private readonly repository: EmergencyContactRepository,
    private readonly people: PersonRepository,
    private readonly audit: AuditService,
  ) {}

  private async ensurePerson(organizationId: string, personId: string): Promise<void> {
    if (!(await this.people.findById(organizationId, personId, true))) {
      throw new NotFoundException(`Person ${personId} not found`);
    }
  }

  async list(organizationId: string, personId: string): Promise<EmergencyContact[]> {
    await this.ensurePerson(organizationId, personId);
    return this.repository.list(personId);
  }

  async create(
    organizationId: string,
    personId: string,
    dto: CreateEmergencyContactDto,
    actorId?: string,
  ): Promise<EmergencyContact> {
    await this.ensurePerson(organizationId, personId);
    if (dto.contactPersonId === personId) {
      throw new BadRequestException('A person cannot be their own emergency contact');
    }
    await this.ensurePerson(organizationId, dto.contactPersonId);

    const existing = await this.repository.list(personId);
    if (existing.some((e) => e.contactPersonId === dto.contactPersonId)) {
      throw new ConflictException('This person is already an emergency contact for this record');
    }

    const created = await this.repository.create(personId, dto);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'EmergencyContact',
      entityId: created.id,
    });
    return created;
  }

  async update(
    organizationId: string,
    personId: string,
    id: string,
    dto: UpdateEmergencyContactDto,
    actorId?: string,
  ): Promise<EmergencyContact> {
    await this.ensurePerson(organizationId, personId);
    const existing = await this.repository.findById(personId, id);
    if (!existing) throw new NotFoundException(`Emergency contact ${id} not found`);
    if (dto.contactPersonId) await this.ensurePerson(organizationId, dto.contactPersonId);

    const updated = await this.repository.update(id, dto);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'EmergencyContact',
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
    if (!existing) throw new NotFoundException(`Emergency contact ${id} not found`);

    await this.repository.remove(id);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'EmergencyContact',
      entityId: id,
    });
  }
}
