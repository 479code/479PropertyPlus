import { Injectable } from '@nestjs/common';
import { type LeaseNote } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class LeaseNoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(leaseId: string): Promise<LeaseNote[]> {
    return this.prisma.leaseNote.findMany({ where: { leaseId }, orderBy: { createdAt: 'desc' } });
  }
  findById(leaseId: string, id: string): Promise<LeaseNote | null> {
    return this.prisma.leaseNote.findFirst({ where: { id, leaseId } });
  }
  create(leaseId: string, note: string, authorId?: string): Promise<LeaseNote> {
    return this.prisma.leaseNote.create({ data: { leaseId, note, authorId } });
  }
  remove(id: string): Promise<LeaseNote> {
    return this.prisma.leaseNote.delete({ where: { id } });
  }
}
