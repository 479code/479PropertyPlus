import { type Paginated } from '@479property/types';
import { paginate } from '@479property/utils';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Building } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NumberGeneratorService } from '../../config/numbering/number-generator.service';
import { PropertyRepository } from '../../property/property.repository';
import { InventoryConfigRepository } from '../config/inventory-config.repository';
import { CountsService } from '../counts/counts.service';

import { BuildingRepository } from './building.repository';
import {
  type CreateBuildingDto,
  type ListBuildingQueryDto,
  type UpdateBuildingDto,
} from './dto/building.dto';

@Injectable()
export class BuildingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: BuildingRepository,
    private readonly properties: PropertyRepository,
    private readonly config: InventoryConfigRepository,
    private readonly numbers: NumberGeneratorService,
    private readonly counts: CountsService,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, id: string, includeArchived = true): Promise<Building> {
    const building = await this.repository.findById(organizationId, id, includeArchived);
    if (!building) throw new NotFoundException(`Building ${id} not found`);
    return building;
  }

  async list(organizationId: string, query: ListBuildingQueryDto): Promise<Paginated<Building>> {
    const [items, total] = await this.repository.list(
      organizationId,
      query.propertyId,
      (query.page - 1) * query.pageSize,
      query.pageSize,
    );
    return paginate(items, total, { page: query.page, pageSize: query.pageSize });
  }

  async create(
    organizationId: string,
    dto: CreateBuildingDto,
    actorId?: string,
  ): Promise<Building> {
    const property = await this.properties.findById(organizationId, dto.propertyId, true);
    if (!property)
      throw new BadRequestException(
        'propertyId does not reference a property in this organization',
      );
    if (dto.statusId && !(await this.config.findBuildingStatus(organizationId, dto.statusId))) {
      throw new BadRequestException(
        'statusId does not reference a building status in this organization',
      );
    }

    const buildingCode =
      dto.buildingCode?.trim() ||
      (await this.numbers.next(organizationId, 'BUILDING', actorId)).formatted;
    if (await this.repository.findByCode(organizationId, buildingCode)) {
      throw new ConflictException(`Building code ${buildingCode} is already in use`);
    }

    const building = await this.prisma.$transaction(async (tx) => {
      const created = await this.repository.create(
        {
          organizationId,
          propertyId: dto.propertyId,
          buildingCode,
          name: dto.name,
          description: dto.description ?? null,
          numberOfFloors: dto.numberOfFloors ?? null,
          yearBuilt: dto.yearBuilt ?? null,
          statusId: dto.statusId ?? null,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          createdBy: actorId ?? null,
          updatedBy: actorId ?? null,
        },
        tx,
      );
      await this.counts.syncProperty(tx, dto.propertyId);
      return created;
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Building',
      entityId: building.id,
      description: `Created building ${buildingCode}`,
    });
    return this.get(organizationId, building.id);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateBuildingDto,
    actorId?: string,
  ): Promise<Building> {
    await this.get(organizationId, id);
    if (dto.statusId && !(await this.config.findBuildingStatus(organizationId, dto.statusId))) {
      throw new BadRequestException(
        'statusId does not reference a building status in this organization',
      );
    }
    await this.repository.update(id, {
      name: dto.name,
      description: dto.description,
      numberOfFloors: dto.numberOfFloors,
      yearBuilt: dto.yearBuilt,
      statusId: dto.statusId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      updatedBy: actorId ?? null,
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Building',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  async archive(organizationId: string, id: string, actorId?: string): Promise<void> {
    const building = await this.get(organizationId, id);
    if (building.deletedAt) throw new ConflictException('Building is already archived');
    await this.prisma.$transaction(async (tx) => {
      await tx.building.update({
        where: { id },
        data: { deletedAt: new Date(), updatedBy: actorId ?? null },
      });
      await this.counts.syncProperty(tx, building.propertyId);
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'ARCHIVE',
      entityType: 'Building',
      entityId: id,
    });
  }

  async restore(organizationId: string, id: string, actorId?: string): Promise<Building> {
    const building = await this.get(organizationId, id);
    if (!building.deletedAt) throw new ConflictException('Building is not archived');
    await this.prisma.$transaction(async (tx) => {
      await tx.building.update({
        where: { id },
        data: { deletedAt: null, updatedBy: actorId ?? null },
      });
      await this.counts.syncBuilding(tx, id);
      await this.counts.syncProperty(tx, building.propertyId);
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'RESTORE',
      entityType: 'Building',
      entityId: id,
    });
    return this.get(organizationId, id);
  }
}
