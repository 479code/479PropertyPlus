import { Injectable } from '@nestjs/common';
import { type EmergencyContact } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface EmergencyContactData {
  contactPersonId: string;
  relationship: string;
  priority?: number;
  isPrimary?: boolean;
  notes?: string;
}

const RELATIONS = { contactPerson: true } as const;

@Injectable()
export class EmergencyContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(personId: string): Promise<EmergencyContact[]> {
    return this.prisma.emergencyContact.findMany({
      where: { personId },
      orderBy: [{ isPrimary: 'desc' }, { priority: 'asc' }],
      include: RELATIONS,
    });
  }

  findById(personId: string, id: string): Promise<EmergencyContact | null> {
    return this.prisma.emergencyContact.findFirst({ where: { id, personId }, include: RELATIONS });
  }

  create(personId: string, data: EmergencyContactData): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.create({ data: { personId, ...data }, include: RELATIONS });
  }

  update(id: string, data: Partial<EmergencyContactData>): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.update({ where: { id }, data, include: RELATIONS });
  }

  remove(id: string): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.delete({ where: { id } });
  }
}
