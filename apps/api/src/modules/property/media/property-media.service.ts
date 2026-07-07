import { Injectable, NotFoundException } from '@nestjs/common';
import { type PropertyDocument, type PropertyImage } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import {
  type CreatePropertyDocumentDto,
  type UpdatePropertyDocumentDto,
} from '../dto/property-document.dto';
import {
  type CreatePropertyImageDto,
  type UpdatePropertyImageDto,
} from '../dto/property-image.dto';
import { PropertyRepository } from '../property.repository';

import { PropertyMediaRepository } from './property-media.repository';

@Injectable()
export class PropertyMediaService {
  constructor(
    private readonly media: PropertyMediaRepository,
    private readonly properties: PropertyRepository,
    private readonly audit: AuditService,
  ) {}

  private async assertProperty(organizationId: string, propertyId: string): Promise<void> {
    const property = await this.properties.findById(organizationId, propertyId, true);
    if (!property) throw new NotFoundException(`Property ${propertyId} not found`);
  }

  // ── Images ──
  async listImages(organizationId: string, propertyId: string): Promise<PropertyImage[]> {
    await this.assertProperty(organizationId, propertyId);
    return this.media.listImages(propertyId);
  }

  async addImage(
    organizationId: string,
    propertyId: string,
    dto: CreatePropertyImageDto,
    actorId?: string,
  ): Promise<PropertyImage> {
    await this.assertProperty(organizationId, propertyId);
    if (dto.isPrimary) await this.media.clearPrimary(propertyId);
    const image = await this.media.createImage(propertyId, { ...dto });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'PropertyImage',
      entityId: image.id,
    });
    return image;
  }

  async updateImage(
    organizationId: string,
    propertyId: string,
    id: string,
    dto: UpdatePropertyImageDto,
    actorId?: string,
  ): Promise<PropertyImage> {
    await this.assertProperty(organizationId, propertyId);
    const existing = await this.media.findImage(id);
    if (!existing || existing.propertyId !== propertyId)
      throw new NotFoundException(`Image ${id} not found`);
    if (dto.isPrimary) await this.media.clearPrimary(propertyId);
    const image = await this.media.updateImage(id, { ...dto });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'PropertyImage',
      entityId: id,
    });
    return image;
  }

  async removeImage(
    organizationId: string,
    propertyId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    await this.assertProperty(organizationId, propertyId);
    const existing = await this.media.findImage(id);
    if (!existing || existing.propertyId !== propertyId)
      throw new NotFoundException(`Image ${id} not found`);
    await this.media.deleteImage(id);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'PropertyImage',
      entityId: id,
    });
  }

  // ── Documents ──
  async listDocuments(organizationId: string, propertyId: string): Promise<PropertyDocument[]> {
    await this.assertProperty(organizationId, propertyId);
    return this.media.listDocuments(propertyId);
  }

  async addDocument(
    organizationId: string,
    propertyId: string,
    dto: CreatePropertyDocumentDto,
    actorId?: string,
  ): Promise<PropertyDocument> {
    await this.assertProperty(organizationId, propertyId);
    const document = await this.media.createDocument(propertyId, { ...dto, uploadedBy: actorId });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'PropertyDocument',
      entityId: document.id,
    });
    return document;
  }

  async updateDocument(
    organizationId: string,
    propertyId: string,
    id: string,
    dto: UpdatePropertyDocumentDto,
    actorId?: string,
  ): Promise<PropertyDocument> {
    await this.assertProperty(organizationId, propertyId);
    const existing = await this.media.findDocument(id);
    if (!existing || existing.propertyId !== propertyId)
      throw new NotFoundException(`Document ${id} not found`);
    const document = await this.media.updateDocument(id, { ...dto });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'PropertyDocument',
      entityId: id,
    });
    return document;
  }

  async removeDocument(
    organizationId: string,
    propertyId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    await this.assertProperty(organizationId, propertyId);
    const existing = await this.media.findDocument(id);
    if (!existing || existing.propertyId !== propertyId)
      throw new NotFoundException(`Document ${id} not found`);
    await this.media.deleteDocument(id);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'PropertyDocument',
      entityId: id,
    });
  }
}
