import { Injectable } from '@nestjs/common';
import { type ContactHistoryEntry, type ContactHistoryType } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface ContactHistoryData {
  type: ContactHistoryType;
  subject?: string;
  notes?: string;
  occurredAt?: Date;
  performedBy?: string;
}

@Injectable()
export class ContactHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(personId: string): Promise<ContactHistoryEntry[]> {
    return this.prisma.contactHistoryEntry.findMany({
      where: { personId },
      orderBy: { occurredAt: 'desc' },
    });
  }

  findById(personId: string, id: string): Promise<ContactHistoryEntry | null> {
    return this.prisma.contactHistoryEntry.findFirst({ where: { id, personId } });
  }

  create(personId: string, data: ContactHistoryData): Promise<ContactHistoryEntry> {
    return this.prisma.contactHistoryEntry.create({ data: { personId, ...data } });
  }

  remove(id: string): Promise<ContactHistoryEntry> {
    return this.prisma.contactHistoryEntry.delete({ where: { id } });
  }
}
