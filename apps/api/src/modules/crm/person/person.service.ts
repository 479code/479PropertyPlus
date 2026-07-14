import { type Paginated } from '@479property/types';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type Person } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NumberGeneratorService } from '../../config/numbering/number-generator.service';
import { slugify } from '../../property/slug.util';
import { CrmConfigRepository } from '../config/crm-config.repository';

import { type CreatePersonDto, type SearchPersonDto, type UpdatePersonDto } from './dto/person.dto';
import { type PersonCreateData, PersonRepository } from './person.repository';

@Injectable()
export class PersonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: PersonRepository,
    private readonly crmConfig: CrmConfigRepository,
    private readonly numbering: NumberGeneratorService,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, id: string, includeArchived = false): Promise<Person> {
    const person = await this.repository.findById(organizationId, id, includeArchived);
    if (!person) throw new NotFoundException(`Person ${id} not found`);
    return person;
  }

  async search(organizationId: string, dto: SearchPersonDto): Promise<Paginated<Person>> {
    const where = this.repository.buildWhere({
      organizationId,
      includeArchived: dto.includeArchived,
      code: dto.code,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      identificationNumber: dto.identificationNumber,
      companyId: dto.companyId,
      personTypeId: dto.personTypeId,
      tagIds: dto.tagIds,
      isActive: dto.isActive,
      global: dto.q,
    });
    const skip = (dto.page - 1) * dto.pageSize;
    const [items, total] = await this.repository.search(
      where,
      { [dto.sortBy]: dto.sortOrder },
      skip,
      dto.pageSize,
    );
    return {
      items,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      pageCount: Math.max(Math.ceil(total / dto.pageSize), 1),
    };
  }

  private async validateRoles(
    organizationId: string,
    roleIds: string[] | undefined,
  ): Promise<void> {
    if (!roleIds?.length) return;
    for (const roleId of roleIds) {
      const type = await this.crmConfig.findPersonType(organizationId, roleId);
      if (!type) throw new NotFoundException(`Person type ${roleId} not found`);
    }
  }

  private async uniqueSlug(organizationId: string, fullName: string): Promise<string> {
    const base = slugify(fullName) || 'person';
    let slug = base;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (!(await this.repository.findBySlug(organizationId, slug))) return slug;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    throw new ConflictException('Could not generate a unique slug; please adjust the name');
  }

  async create(organizationId: string, dto: CreatePersonDto, actorId?: string): Promise<Person> {
    await this.validateRoles(organizationId, dto.roleIds);

    const fullName = [dto.firstName, dto.middleName, dto.lastName].filter(Boolean).join(' ');
    const slug = await this.uniqueSlug(organizationId, fullName);
    const personCode =
      dto.personCode?.trim() ||
      (await this.numbering.next(organizationId, 'PERSON', actorId)).formatted;
    if (await this.repository.findByCode(organizationId, personCode)) {
      throw new ConflictException(`Person code ${personCode} is already in use`);
    }

    const person = await this.prisma.$transaction(async (tx) => {
      const data: PersonCreateData = {
        organizationId,
        personCode,
        slug,
        firstName: dto.firstName,
        middleName: dto.middleName ?? null,
        lastName: dto.lastName,
        fullName,
        gender: dto.gender ?? null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        maritalStatus: dto.maritalStatus ?? null,
        nationality: dto.nationality ?? null,
        occupation: dto.occupation ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        alternatePhone: dto.alternatePhone ?? null,
        profilePhoto: dto.profilePhoto ?? null,
        address: dto.address ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        country: dto.country ?? null,
        postalCode: dto.postalCode ?? null,
        identificationType: dto.identificationType ?? null,
        identificationNumber: dto.identificationNumber ?? null,
        identificationExpiry: dto.identificationExpiry ? new Date(dto.identificationExpiry) : null,
        taxIdentificationNumber: dto.taxIdentificationNumber ?? null,
        notes: dto.notes ?? null,
        isActive: dto.isActive ?? true,
        createdBy: actorId ?? null,
        updatedBy: actorId ?? null,
      };
      const created = await this.repository.create(data, tx);

      if (dto.roleIds?.length) {
        await this.repository.replaceRoles(tx, created.id, dto.roleIds, dto.primaryRoleId);
      }
      return created;
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Person',
      entityId: person.id,
    });
    return this.get(organizationId, person.id);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdatePersonDto,
    actorId?: string,
  ): Promise<Person> {
    await this.get(organizationId, id);
    await this.validateRoles(organizationId, dto.roleIds);

    await this.prisma.$transaction(async (tx) => {
      const patch: Record<string, unknown> = { ...dto, updatedBy: actorId };
      delete patch.roleIds;
      delete patch.primaryRoleId;
      if (dto.dateOfBirth !== undefined)
        patch.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
      if (dto.identificationExpiry !== undefined) {
        patch.identificationExpiry = dto.identificationExpiry
          ? new Date(dto.identificationExpiry)
          : null;
      }
      if (dto.firstName || dto.middleName !== undefined || dto.lastName) {
        const current = await this.get(organizationId, id);
        const firstName = dto.firstName ?? current.firstName;
        const middleName = dto.middleName !== undefined ? dto.middleName : current.middleName;
        const lastName = dto.lastName ?? current.lastName;
        patch.fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
      }
      await this.repository.update(id, patch, tx);

      if (dto.roleIds) {
        await this.repository.clearRoles(tx, id);
        if (dto.roleIds.length)
          await this.repository.replaceRoles(tx, id, dto.roleIds, dto.primaryRoleId);
      }
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Person',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  async archive(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.get(organizationId, id);
    await this.repository.update(id, {
      deletedAt: new Date(),
      isActive: false,
      updatedBy: actorId,
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'ARCHIVE',
      entityType: 'Person',
      entityId: id,
    });
  }

  async restore(organizationId: string, id: string, actorId?: string): Promise<Person> {
    await this.get(organizationId, id, true);
    await this.repository.update(id, { deletedAt: null, isActive: true, updatedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'RESTORE',
      entityType: 'Person',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  // ── Tags ──
  async addTag(
    organizationId: string,
    personId: string,
    tagId: string,
    actorId?: string,
  ): Promise<Person> {
    await this.get(organizationId, personId);
    const tag = await this.crmConfig.findPersonTag(organizationId, tagId);
    if (!tag) throw new NotFoundException(`Person tag ${tagId} not found`);
    await this.repository.addTag(personId, tagId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Person',
      entityId: personId,
      description: `Tagged with ${tag.name}`,
    });
    return this.get(organizationId, personId);
  }

  async removeTag(
    organizationId: string,
    personId: string,
    tagId: string,
    actorId?: string,
  ): Promise<Person> {
    await this.get(organizationId, personId);
    await this.repository.removeTag(personId, tagId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Person',
      entityId: personId,
      description: 'Tag removed',
    });
    return this.get(organizationId, personId);
  }
}
