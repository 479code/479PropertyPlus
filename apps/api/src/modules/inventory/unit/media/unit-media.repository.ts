import { Injectable } from '@nestjs/common';
import { type UnitDocument, type UnitDocumentType, type UnitImage } from '@prisma/client';

import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class UnitMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  listImages(unitId: string): Promise<UnitImage[]> {
    return this.prisma.unitImage.findMany({ where: { unitId }, orderBy: { sortOrder: 'asc' } });
  }
  findImage(id: string): Promise<UnitImage | null> {
    return this.prisma.unitImage.findUnique({ where: { id } });
  }
  createImage(
    unitId: string,
    data: { url: string; caption?: string; sortOrder?: number; isPrimary?: boolean },
  ): Promise<UnitImage> {
    return this.prisma.unitImage.create({
      data: {
        unitId,
        url: data.url,
        caption: data.caption,
        sortOrder: data.sortOrder ?? 0,
        isPrimary: data.isPrimary ?? false,
      },
    });
  }
  updateImage(
    id: string,
    data: { url?: string; caption?: string; sortOrder?: number; isPrimary?: boolean },
  ): Promise<UnitImage> {
    return this.prisma.unitImage.update({ where: { id }, data });
  }
  deleteImage(id: string): Promise<UnitImage> {
    return this.prisma.unitImage.delete({ where: { id } });
  }
  clearPrimary(unitId: string): Promise<{ count: number }> {
    return this.prisma.unitImage.updateMany({
      where: { unitId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  listDocuments(unitId: string): Promise<UnitDocument[]> {
    return this.prisma.unitDocument.findMany({ where: { unitId }, orderBy: { createdAt: 'desc' } });
  }
  findDocument(id: string): Promise<UnitDocument | null> {
    return this.prisma.unitDocument.findUnique({ where: { id } });
  }
  createDocument(
    unitId: string,
    data: {
      documentType: UnitDocumentType;
      name: string;
      url: string;
      description?: string;
      uploadedBy?: string;
    },
  ): Promise<UnitDocument> {
    return this.prisma.unitDocument.create({
      data: {
        unitId,
        documentType: data.documentType,
        name: data.name,
        url: data.url,
        description: data.description,
        uploadedBy: data.uploadedBy,
      },
    });
  }
  updateDocument(
    id: string,
    data: { documentType?: UnitDocumentType; name?: string; url?: string; description?: string },
  ): Promise<UnitDocument> {
    return this.prisma.unitDocument.update({ where: { id }, data });
  }
  deleteDocument(id: string): Promise<UnitDocument> {
    return this.prisma.unitDocument.delete({ where: { id } });
  }
}
