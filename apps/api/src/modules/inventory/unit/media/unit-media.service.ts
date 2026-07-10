import { Injectable, NotFoundException } from '@nestjs/common';
import { type UnitDocument, type UnitImage } from '@prisma/client';

import { AuditService } from '../../../audit/audit.service';
import {
  type CreateUnitDocumentDto,
  type UpdateUnitDocumentDto,
  type CreateUnitImageDto,
  type UpdateUnitImageDto,
} from '../dto/unit-media.dto';
import { UnitRepository } from '../unit.repository';

import { UnitMediaRepository } from './unit-media.repository';

@Injectable()
export class UnitMediaService {
  constructor(
    private readonly media: UnitMediaRepository,
    private readonly units: UnitRepository,
    private readonly audit: AuditService,
  ) {}

  private async assertUnit(organizationId: string, unitId: string): Promise<void> {
    if (!(await this.units.findById(organizationId, unitId, true)))
      throw new NotFoundException(`Unit ${unitId} not found`);
  }

  listImages(o: string, unitId: string): Promise<UnitImage[]> {
    return this.assertUnit(o, unitId).then(() => this.media.listImages(unitId));
  }

  async addImage(
    o: string,
    unitId: string,
    dto: CreateUnitImageDto,
    actorId?: string,
  ): Promise<UnitImage> {
    await this.assertUnit(o, unitId);
    if (dto.isPrimary) await this.media.clearPrimary(unitId);
    const image = await this.media.createImage(unitId, dto);
    await this.audit.record({
      organizationId: o,
      userId: actorId,
      action: 'CREATE',
      entityType: 'UnitImage',
      entityId: image.id,
    });
    return image;
  }

  async updateImage(
    o: string,
    unitId: string,
    id: string,
    dto: UpdateUnitImageDto,
    actorId?: string,
  ): Promise<UnitImage> {
    await this.assertUnit(o, unitId);
    const existing = await this.media.findImage(id);
    if (!existing || existing.unitId !== unitId)
      throw new NotFoundException(`Image ${id} not found`);
    if (dto.isPrimary) await this.media.clearPrimary(unitId);
    const image = await this.media.updateImage(id, dto);
    await this.audit.record({
      organizationId: o,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'UnitImage',
      entityId: id,
    });
    return image;
  }

  async removeImage(o: string, unitId: string, id: string, actorId?: string): Promise<void> {
    await this.assertUnit(o, unitId);
    const existing = await this.media.findImage(id);
    if (!existing || existing.unitId !== unitId)
      throw new NotFoundException(`Image ${id} not found`);
    await this.media.deleteImage(id);
    await this.audit.record({
      organizationId: o,
      userId: actorId,
      action: 'DELETE',
      entityType: 'UnitImage',
      entityId: id,
    });
  }

  listDocuments(o: string, unitId: string): Promise<UnitDocument[]> {
    return this.assertUnit(o, unitId).then(() => this.media.listDocuments(unitId));
  }

  async addDocument(
    o: string,
    unitId: string,
    dto: CreateUnitDocumentDto,
    actorId?: string,
  ): Promise<UnitDocument> {
    await this.assertUnit(o, unitId);
    const doc = await this.media.createDocument(unitId, { ...dto, uploadedBy: actorId });
    await this.audit.record({
      organizationId: o,
      userId: actorId,
      action: 'CREATE',
      entityType: 'UnitDocument',
      entityId: doc.id,
    });
    return doc;
  }

  async updateDocument(
    o: string,
    unitId: string,
    id: string,
    dto: UpdateUnitDocumentDto,
    actorId?: string,
  ): Promise<UnitDocument> {
    await this.assertUnit(o, unitId);
    const existing = await this.media.findDocument(id);
    if (!existing || existing.unitId !== unitId)
      throw new NotFoundException(`Document ${id} not found`);
    const doc = await this.media.updateDocument(id, dto);
    await this.audit.record({
      organizationId: o,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'UnitDocument',
      entityId: id,
    });
    return doc;
  }

  async removeDocument(o: string, unitId: string, id: string, actorId?: string): Promise<void> {
    await this.assertUnit(o, unitId);
    const existing = await this.media.findDocument(id);
    if (!existing || existing.unitId !== unitId)
      throw new NotFoundException(`Document ${id} not found`);
    await this.media.deleteDocument(id);
    await this.audit.record({
      organizationId: o,
      userId: actorId,
      action: 'DELETE',
      entityType: 'UnitDocument',
      entityId: id,
    });
  }
}
