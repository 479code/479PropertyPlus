import { Injectable, NotFoundException } from '@nestjs/common';
import { type LeaseNote } from '@prisma/client';

import { LeaseRepository } from '../lease/lease.repository';

import { LeaseNoteRepository } from './lease-note.repository';

@Injectable()
export class LeaseNoteService {
  constructor(
    private readonly repository: LeaseNoteRepository,
    private readonly leases: LeaseRepository,
  ) {}

  private async ensureLease(organizationId: string, leaseId: string): Promise<void> {
    if (!(await this.leases.findById(organizationId, leaseId, true))) {
      throw new NotFoundException(`Lease ${leaseId} not found`);
    }
  }

  async list(organizationId: string, leaseId: string): Promise<LeaseNote[]> {
    await this.ensureLease(organizationId, leaseId);
    return this.repository.list(leaseId);
  }

  async create(
    organizationId: string,
    leaseId: string,
    note: string,
    authorId?: string,
  ): Promise<LeaseNote> {
    await this.ensureLease(organizationId, leaseId);
    return this.repository.create(leaseId, note, authorId);
  }

  async remove(organizationId: string, leaseId: string, id: string): Promise<void> {
    await this.ensureLease(organizationId, leaseId);
    if (!(await this.repository.findById(leaseId, id)))
      throw new NotFoundException(`Note ${id} not found`);
    await this.repository.remove(id);
  }
}
