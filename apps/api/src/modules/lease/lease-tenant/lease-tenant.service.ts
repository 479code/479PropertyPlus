import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type LeaseTenant } from '@prisma/client';

import { PersonRepository } from '../../crm/person/person.repository';
import { LeaseRepository } from '../lease/lease.repository';

import { type AddLeaseTenantDto, type UpdateLeaseTenantDto } from './dto/lease-tenant.dto';
import { LeaseTenantRepository } from './lease-tenant.repository';

@Injectable()
export class LeaseTenantService {
  constructor(
    private readonly repository: LeaseTenantRepository,
    private readonly leases: LeaseRepository,
    private readonly people: PersonRepository,
  ) {}

  private async ensureLease(organizationId: string, leaseId: string): Promise<void> {
    if (!(await this.leases.findById(organizationId, leaseId, true))) {
      throw new NotFoundException(`Lease ${leaseId} not found`);
    }
  }

  list(organizationId: string, leaseId: string): Promise<LeaseTenant[]> {
    return this.ensureLease(organizationId, leaseId).then(() => this.repository.list(leaseId));
  }

  async add(organizationId: string, leaseId: string, dto: AddLeaseTenantDto): Promise<LeaseTenant> {
    await this.ensureLease(organizationId, leaseId);
    if (!(await this.people.findById(organizationId, dto.personId, true))) {
      throw new NotFoundException(`Person ${dto.personId} not found`);
    }
    if (await this.repository.findByPerson(leaseId, dto.personId)) {
      throw new ConflictException('This person is already a tenant on this lease');
    }
    return this.repository.create(leaseId, dto);
  }

  async update(
    organizationId: string,
    leaseId: string,
    id: string,
    dto: UpdateLeaseTenantDto,
  ): Promise<LeaseTenant> {
    await this.ensureLease(organizationId, leaseId);
    if (!(await this.repository.findById(leaseId, id)))
      throw new NotFoundException(`Lease tenant ${id} not found`);
    return this.repository.update(id, dto);
  }

  async remove(organizationId: string, leaseId: string, id: string): Promise<void> {
    await this.ensureLease(organizationId, leaseId);
    if (!(await this.repository.findById(leaseId, id)))
      throw new NotFoundException(`Lease tenant ${id} not found`);
    await this.repository.remove(id);
  }
}
