import { Injectable } from '@nestjs/common';
import { type DocumentType, type PropertyDocument, type PropertyImage } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PropertyMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Images ──
  listImages(propertyId: string): Promise<PropertyImage[]> {
    return this.prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' },
    });
  }
  findImage(id: string): Promise<PropertyImage | null> {
    return this.prisma.propertyImage.findUnique({ where: { id } });
  }
  createImage(
    propertyId: string,
    data: { url: string; caption?: string; sortOrder?: number; isPrimary?: boolean },
  ): Promise<PropertyImage> {
    return this.prisma.propertyImage.create({ data: { propertyId, ...data } });
  }
  updateImage(id: string, data: Record<string, unknown>): Promise<PropertyImage> {
    return this.prisma.propertyImage.update({ where: { id }, data });
  }
  deleteImage(id: string): Promise<PropertyImage> {
    return this.prisma.propertyImage.delete({ where: { id } });
  }
  clearPrimary(propertyId: string): Promise<{ count: number }> {
    return this.prisma.propertyImage.updateMany({
      where: { propertyId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  // ── Documents ──
  listDocuments(propertyId: string): Promise<PropertyDocument[]> {
    return this.prisma.propertyDocument.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }
  findDocument(id: string): Promise<PropertyDocument | null> {
    return this.prisma.propertyDocument.findUnique({ where: { id } });
  }
  createDocument(
    propertyId: string,
    data: {
      documentType: DocumentType;
      name: string;
      url: string;
      description?: string;
      uploadedBy?: string;
    },
  ): Promise<PropertyDocument> {
    return this.prisma.propertyDocument.create({ data: { propertyId, ...data } });
  }
  updateDocument(id: string, data: Record<string, unknown>): Promise<PropertyDocument> {
    return this.prisma.propertyDocument.update({ where: { id }, data });
  }
  deleteDocument(id: string): Promise<PropertyDocument> {
    return this.prisma.propertyDocument.delete({ where: { id } });
  }
}
