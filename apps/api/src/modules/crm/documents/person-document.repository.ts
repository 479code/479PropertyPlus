import { Injectable } from '@nestjs/common';
import { type PersonDocument, type PersonDocumentType } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface PersonDocumentData {
  documentType: PersonDocumentType;
  name: string;
  url: string;
  description?: string;
  uploadedBy?: string;
}

@Injectable()
export class PersonDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(personId: string): Promise<PersonDocument[]> {
    return this.prisma.personDocument.findMany({
      where: { personId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(personId: string, id: string): Promise<PersonDocument | null> {
    return this.prisma.personDocument.findFirst({ where: { id, personId } });
  }

  create(personId: string, data: PersonDocumentData): Promise<PersonDocument> {
    return this.prisma.personDocument.create({ data: { personId, ...data } });
  }

  update(id: string, data: Partial<PersonDocumentData>): Promise<PersonDocument> {
    return this.prisma.personDocument.update({ where: { id }, data });
  }

  remove(id: string): Promise<PersonDocument> {
    return this.prisma.personDocument.delete({ where: { id } });
  }
}
