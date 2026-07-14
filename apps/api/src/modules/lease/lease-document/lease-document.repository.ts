import { Injectable } from '@nestjs/common';
import { type LeaseDocument, type LeaseDocumentType } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface LeaseDocumentData {
  documentType: LeaseDocumentType;
  name: string;
  url: string;
  description?: string;
  uploadedBy?: string;
}

@Injectable()
export class LeaseDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(leaseId: string): Promise<LeaseDocument[]> {
    return this.prisma.leaseDocument.findMany({
      where: { leaseId },
      orderBy: { createdAt: 'desc' },
    });
  }
  findById(leaseId: string, id: string): Promise<LeaseDocument | null> {
    return this.prisma.leaseDocument.findFirst({ where: { id, leaseId } });
  }
  create(leaseId: string, data: LeaseDocumentData): Promise<LeaseDocument> {
    return this.prisma.leaseDocument.create({ data: { leaseId, ...data } });
  }
  update(id: string, data: Partial<LeaseDocumentData>): Promise<LeaseDocument> {
    return this.prisma.leaseDocument.update({ where: { id }, data });
  }
  remove(id: string): Promise<LeaseDocument> {
    return this.prisma.leaseDocument.delete({ where: { id } });
  }
}
