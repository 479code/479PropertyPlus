import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { type PersonTag, type PersonType } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { type PrismaDb } from '../../rbac/rbac.repository';

import { CrmConfigRepository } from './crm-config.repository';
import { DEFAULT_PERSON_TAGS, DEFAULT_PERSON_TYPES } from './default-crm-config';
import {
  type CreatePersonTagDto,
  type CreatePersonTypeDto,
  type UpdatePersonTagDto,
  type UpdatePersonTypeDto,
} from './dto/crm-config.dto';

@Injectable()
export class CrmConfigService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CrmConfigService.name);

  constructor(
    private readonly repository: CrmConfigRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.backfillAll();
    } catch (error) {
      this.logger.error('CRM config backfill failed', error as Error);
    }
  }

  private rec(
    organizationId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    actorId?: string,
  ): Promise<void> {
    return this.audit.record({ organizationId, userId: actorId, action, entityType, entityId });
  }

  // ── PersonType ──
  listPersonTypes(orgId: string): Promise<PersonType[]> {
    return this.repository.listPersonTypes(orgId);
  }
  async getPersonType(orgId: string, id: string): Promise<PersonType> {
    const f = await this.repository.findPersonType(orgId, id);
    if (!f) throw new NotFoundException(`Person type ${id} not found`);
    return f;
  }
  async createPersonType(
    orgId: string,
    dto: CreatePersonTypeDto,
    actorId?: string,
  ): Promise<PersonType> {
    if (await this.repository.findPersonTypeByName(orgId, dto.name))
      throw new ConflictException(`Person type "${dto.name}" already exists`);
    const created = await this.repository.createPersonType(orgId, dto, actorId);
    await this.rec(orgId, 'CREATE', 'PersonType', created.id, actorId);
    return created;
  }
  async updatePersonType(
    orgId: string,
    id: string,
    dto: UpdatePersonTypeDto,
    actorId?: string,
  ): Promise<PersonType> {
    await this.getPersonType(orgId, id);
    const updated = await this.repository.updatePersonType(id, dto, actorId);
    await this.rec(orgId, 'UPDATE', 'PersonType', id, actorId);
    return updated;
  }
  async removePersonType(orgId: string, id: string, actorId?: string): Promise<void> {
    await this.getPersonType(orgId, id);
    await this.repository.softDeletePersonType(id, actorId);
    await this.rec(orgId, 'DELETE', 'PersonType', id, actorId);
  }

  // ── PersonTag ──
  listPersonTags(orgId: string): Promise<PersonTag[]> {
    return this.repository.listPersonTags(orgId);
  }
  async getPersonTag(orgId: string, id: string): Promise<PersonTag> {
    const f = await this.repository.findPersonTag(orgId, id);
    if (!f) throw new NotFoundException(`Person tag ${id} not found`);
    return f;
  }
  async createPersonTag(
    orgId: string,
    dto: CreatePersonTagDto,
    actorId?: string,
  ): Promise<PersonTag> {
    if (await this.repository.findPersonTagByName(orgId, dto.name))
      throw new ConflictException(`Person tag "${dto.name}" already exists`);
    const created = await this.repository.createPersonTag(orgId, dto, actorId);
    await this.rec(orgId, 'CREATE', 'PersonTag', created.id, actorId);
    return created;
  }
  async updatePersonTag(
    orgId: string,
    id: string,
    dto: UpdatePersonTagDto,
    actorId?: string,
  ): Promise<PersonTag> {
    await this.getPersonTag(orgId, id);
    const updated = await this.repository.updatePersonTag(id, dto, actorId);
    await this.rec(orgId, 'UPDATE', 'PersonTag', id, actorId);
    return updated;
  }
  async removePersonTag(orgId: string, id: string, actorId?: string): Promise<void> {
    await this.getPersonTag(orgId, id);
    await this.repository.softDeletePersonTag(id, actorId);
    await this.rec(orgId, 'DELETE', 'PersonTag', id, actorId);
  }

  /**
   * Seed defaults for one organization. Only seeds categories that are currently
   * empty, so it is safe to run at signup AND as an idempotent backfill.
   */
  async seedDefaults(db: PrismaDb, organizationId: string, actorId?: string): Promise<void> {
    const [types, tags] = await Promise.all([
      this.repository.countPersonTypes(organizationId),
      this.repository.countPersonTags(organizationId),
    ]);

    const work: Array<Promise<unknown>> = [];
    if (types === 0)
      DEFAULT_PERSON_TYPES.forEach((name, i) =>
        work.push(
          this.repository.createPersonType(organizationId, { name, displayOrder: i }, actorId, db),
        ),
      );
    if (tags === 0)
      DEFAULT_PERSON_TAGS.forEach((t, i) =>
        work.push(
          this.repository.createPersonTag(
            organizationId,
            { name: t.name, color: t.color, displayOrder: i },
            actorId,
            db,
          ),
        ),
      );
    await Promise.all(work);
  }

  /** Seed missing CRM config for every existing organization. Safe to run repeatedly. */
  async backfillAll(): Promise<void> {
    const orgs = await this.repository.listOrganizationIds();
    let seeded = 0;
    for (const org of orgs) {
      const before = await this.repository.countPersonTypes(org.id);
      await this.seedDefaults(this.prisma, org.id);
      if (before === 0) seeded += 1;
    }
    if (seeded > 0) this.logger.log(`CRM config backfilled for ${seeded} organization(s)`);
  }
}
