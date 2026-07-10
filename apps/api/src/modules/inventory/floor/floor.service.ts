import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { type Floor } from '@prisma/client';

import { AuditService } from '../../audit/audit.service';
import { BuildingRepository } from '../building/building.repository';

import { type CreateFloorDto, type UpdateFloorDto } from './dto/floor.dto';
import { FloorRepository } from './floor.repository';

@Injectable()
export class FloorService {
  constructor(
    private readonly repository: FloorRepository,
    private readonly buildings: BuildingRepository,
    private readonly audit: AuditService,
  ) {}

  async listByBuilding(organizationId: string, buildingId: string): Promise<Floor[]> {
    await this.assertBuilding(organizationId, buildingId);
    return this.repository.listByBuilding(organizationId, buildingId);
  }

  async create(organizationId: string, dto: CreateFloorDto, actorId?: string): Promise<Floor> {
    await this.assertBuilding(organizationId, dto.buildingId);
    const floor = await this.repository.create({
      organizationId,
      buildingId: dto.buildingId,
      name: dto.name,
      floorNumber: dto.floorNumber ?? null,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      createdBy: actorId ?? null,
      updatedBy: actorId ?? null,
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Floor',
      entityId: floor.id,
    });
    return floor;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateFloorDto,
    actorId?: string,
  ): Promise<Floor> {
    await this.get(organizationId, id);
    const floor = await this.repository.update(id, {
      name: dto.name,
      floorNumber: dto.floorNumber,
      description: dto.description,
      sortOrder: dto.sortOrder,
      updatedBy: actorId ?? null,
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Floor',
      entityId: id,
    });
    return floor;
  }

  async remove(organizationId: string, id: string, actorId?: string): Promise<void> {
    await this.get(organizationId, id);
    await this.repository.softDelete(id, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'DELETE',
      entityType: 'Floor',
      entityId: id,
    });
  }

  private async get(organizationId: string, id: string): Promise<Floor> {
    const floor = await this.repository.findById(organizationId, id);
    if (!floor) throw new NotFoundException(`Floor ${id} not found`);
    return floor;
  }

  private async assertBuilding(organizationId: string, buildingId: string): Promise<void> {
    if (!(await this.buildings.findById(organizationId, buildingId, true))) {
      throw new BadRequestException(
        'buildingId does not reference a building in this organization',
      );
    }
  }
}
