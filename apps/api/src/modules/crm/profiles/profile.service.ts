import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { type AgentProfile, type OwnerProfile, type TenantProfile } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { CompanyRepository } from '../company/company.repository';
import { PersonRepository } from '../person/person.repository';

import {
  type PatchAgentProfileDto,
  type PatchOwnerProfileDto,
  type PatchTenantProfileDto,
  type UpsertAgentProfileDto,
  type UpsertOwnerProfileDto,
  type UpsertTenantProfileDto,
} from './dto/profile.dto';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly people: PersonRepository,
    private readonly companies: CompanyRepository,
    private readonly audit: AuditService,
  ) {}

  private async ensurePerson(organizationId: string, personId: string): Promise<void> {
    if (!(await this.people.findById(organizationId, personId, true))) {
      throw new NotFoundException(`Person ${personId} not found`);
    }
  }

  // ── Tenant ──
  async getTenantProfile(organizationId: string, personId: string): Promise<TenantProfile> {
    await this.ensurePerson(organizationId, personId);
    const profile = await this.repository.findTenantProfile(personId);
    if (!profile) throw new NotFoundException('This person has no tenant profile');
    return profile;
  }

  async upsertTenantProfile(
    organizationId: string,
    personId: string,
    dto: UpsertTenantProfileDto | PatchTenantProfileDto,
    actorId?: string,
  ): Promise<TenantProfile> {
    await this.ensurePerson(organizationId, personId);
    if (dto.companyId && !(await this.companies.findById(organizationId, dto.companyId))) {
      throw new BadRequestException('companyId does not reference a company in this organization');
    }
    if (dto.defaultGuarantorPersonId) {
      await this.ensurePerson(organizationId, dto.defaultGuarantorPersonId);
    }
    const profile = await this.repository.upsertTenantProfile(personId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'TenantProfile',
      entityId: profile.id,
    });
    return profile;
  }

  async removeTenantProfile(
    organizationId: string,
    personId: string,
    actorId?: string,
  ): Promise<void> {
    const profile = await this.getTenantProfile(organizationId, personId);
    await this.repository.deleteTenantProfile(personId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'TenantProfile',
      entityId: profile.id,
    });
  }

  // ── Agent ──
  async getAgentProfile(organizationId: string, personId: string): Promise<AgentProfile> {
    await this.ensurePerson(organizationId, personId);
    const profile = await this.repository.findAgentProfile(personId);
    if (!profile) throw new NotFoundException('This person has no agent profile');
    return profile;
  }

  async upsertAgentProfile(
    organizationId: string,
    personId: string,
    dto: UpsertAgentProfileDto | PatchAgentProfileDto,
    actorId?: string,
  ): Promise<AgentProfile> {
    await this.ensurePerson(organizationId, personId);
    const profile = await this.repository.upsertAgentProfile(personId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'AgentProfile',
      entityId: profile.id,
    });
    return profile;
  }

  async removeAgentProfile(
    organizationId: string,
    personId: string,
    actorId?: string,
  ): Promise<void> {
    const profile = await this.getAgentProfile(organizationId, personId);
    await this.repository.deleteAgentProfile(personId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'AgentProfile',
      entityId: profile.id,
    });
  }

  // ── Owner ──
  async getOwnerProfile(organizationId: string, personId: string): Promise<OwnerProfile> {
    await this.ensurePerson(organizationId, personId);
    const profile = await this.repository.findOwnerProfile(personId);
    if (!profile) throw new NotFoundException('This person has no owner profile');
    return profile;
  }

  async upsertOwnerProfile(
    organizationId: string,
    personId: string,
    dto: UpsertOwnerProfileDto | PatchOwnerProfileDto,
    actorId?: string,
  ): Promise<OwnerProfile> {
    await this.ensurePerson(organizationId, personId);
    const profile = await this.repository.upsertOwnerProfile(personId, dto, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'OwnerProfile',
      entityId: profile.id,
    });
    return profile;
  }

  async removeOwnerProfile(
    organizationId: string,
    personId: string,
    actorId?: string,
  ): Promise<void> {
    const profile = await this.getOwnerProfile(organizationId, personId);
    await this.repository.deleteOwnerProfile(personId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'OwnerProfile',
      entityId: profile.id,
    });
  }
}
