import { type Paginated } from '@479property/types';
import { paginate } from '@479property/utils';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma, type Unit, type UnitAvailability } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NumberGeneratorService } from '../../config/numbering/number-generator.service';
import { PropertyRepository } from '../../property/property.repository';
import { slugify } from '../../property/slug.util';
import {
  AvailabilityService,
  type AvailabilityUnitLike,
} from '../availability/availability.service';
import { BuildingRepository } from '../building/building.repository';
import { InventoryConfigRepository } from '../config/inventory-config.repository';
import { CountsService } from '../counts/counts.service';
import { FloorRepository } from '../floor/floor.repository';

import { type CreateUnitDto, type SearchUnitDto, type UpdateUnitDto } from './dto/unit.dto';
import { UnitEventsRepository } from './unit-events.repository';
import { UnitRepository } from './unit.repository';

@Injectable()
export class UnitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: UnitRepository,
    private readonly events: UnitEventsRepository,
    private readonly config: InventoryConfigRepository,
    private readonly properties: PropertyRepository,
    private readonly buildings: BuildingRepository,
    private readonly floors: FloorRepository,
    private readonly numbers: NumberGeneratorService,
    private readonly availability: AvailabilityService,
    private readonly counts: CountsService,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, id: string, includeArchived = true): Promise<Unit> {
    const unit = await this.repository.findById(organizationId, id, includeArchived);
    if (!unit) throw new NotFoundException(`Unit ${id} not found`);
    return unit;
  }

  async search(organizationId: string, dto: SearchUnitDto): Promise<Paginated<Unit>> {
    const where = this.repository.buildWhere({
      organizationId,
      includeArchived: dto.includeArchived,
      code: dto.code,
      name: dto.name,
      global: dto.q,
      propertyId: dto.propertyId,
      buildingId: dto.buildingId,
      floorId: dto.floorId,
      unitTypeId: dto.unitTypeId,
      statusId: dto.statusId,
      availability: dto.availability as UnitAvailability | undefined,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      rentMin: dto.rentMin,
      rentMax: dto.rentMax,
      featureIds: dto.featureIds,
    });
    const orderBy = { [dto.sortBy]: dto.sortOrder } as Prisma.UnitOrderByWithRelationInput;
    const [items, total] = await this.repository.search(
      where,
      orderBy,
      (dto.page - 1) * dto.pageSize,
      dto.pageSize,
    );
    return paginate(items, total, { page: dto.page, pageSize: dto.pageSize });
  }

  async timeline(organizationId: string, id: string): Promise<unknown[]> {
    await this.get(organizationId, id);
    return this.events.listTimeline(id);
  }
  async occupancyHistory(organizationId: string, id: string): Promise<unknown[]> {
    await this.get(organizationId, id);
    return this.events.listOccupancy(id);
  }

  async create(organizationId: string, dto: CreateUnitDto, actorId?: string): Promise<Unit> {
    await this.validateReferences(organizationId, dto);

    const unitCode =
      dto.unitCode?.trim() || (await this.numbers.next(organizationId, 'UNIT', actorId)).formatted;
    if (await this.repository.findByCode(organizationId, unitCode)) {
      throw new ConflictException(`Unit code ${unitCode} is already in use`);
    }
    const slug = await this.uniqueSlug(organizationId, dto.name);

    const like: AvailabilityUnitLike = {
      deletedAt: null,
      isActive: true,
      isReserved: dto.isReserved ?? false,
      isBlocked: dto.isBlocked ?? false,
    };
    const availability = this.availability.computeFor(like);

    const unit = await this.prisma.$transaction(async (tx) => {
      const created = await this.repository.create(
        {
          organizationId,
          propertyId: dto.propertyId,
          buildingId: dto.buildingId ?? null,
          floorId: dto.floorId ?? null,
          unitCode,
          slug,
          name: dto.name,
          description: dto.description ?? null,
          unitTypeId: dto.unitTypeId,
          statusId: dto.statusId,
          availability,
          isReserved: dto.isReserved ?? false,
          isBlocked: dto.isBlocked ?? false,
          bedrooms: dto.bedrooms ?? null,
          bathrooms: dto.bathrooms ?? null,
          kitchens: dto.kitchens ?? null,
          parkingSpaces: dto.parkingSpaces ?? null,
          size: dto.size ?? null,
          sizeUnit: dto.sizeUnit ?? null,
          monthlyRent: dto.monthlyRent ?? null,
          annualRent: dto.annualRent ?? null,
          securityDeposit: dto.securityDeposit ?? null,
          serviceCharge: dto.serviceCharge ?? null,
          expectedAnnualRevenue: dto.expectedAnnualRevenue ?? null,
          marketValue: dto.marketValue ?? null,
          ownerType: dto.ownerType ?? null,
          ownerReferenceId: dto.ownerReferenceId ?? null,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          isRentable: dto.isRentable ?? true,
          createdBy: actorId ?? null,
          updatedBy: actorId ?? null,
        },
        tx,
      );
      if (dto.featureIds?.length)
        await this.repository.replaceFeatures(tx, created.id, dedupe(dto.featureIds));
      await this.events.recordTimeline(tx, created.id, 'CREATED', actorId);
      await this.events.recordOccupancy(
        tx,
        created.id,
        null,
        availability,
        actorId,
        'Unit created',
      );
      await this.counts.syncForUnit(tx, dto.propertyId, dto.buildingId ?? null);
      return created;
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Unit',
      entityId: unit.id,
      description: `Created unit ${unitCode}`,
    });
    return this.get(organizationId, unit.id);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateUnitDto,
    actorId?: string,
  ): Promise<Unit> {
    const existing = await this.get(organizationId, id);
    await this.validateReferences(organizationId, dto);

    const previousAvailability = existing.availability;
    const previousBuildingId = existing.buildingId;

    const like: AvailabilityUnitLike = {
      deletedAt: existing.deletedAt,
      isActive: existing.isActive,
      isReserved: dto.isReserved ?? existing.isReserved,
      isBlocked: dto.isBlocked ?? existing.isBlocked,
    };
    const availability = this.availability.computeFor(like);

    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(
        id,
        {
          ...this.assignable(dto),
          availability,
          updatedBy: actorId ?? null,
        },
        tx,
      );
      if (dto.featureIds) {
        await this.repository.clearFeatures(tx, id);
        if (dto.featureIds.length)
          await this.repository.replaceFeatures(tx, id, dedupe(dto.featureIds));
      }
      await this.events.recordTimeline(tx, id, 'UPDATED', actorId);
      if (availability !== previousAvailability) {
        await this.events.recordOccupancy(
          tx,
          id,
          previousAvailability,
          availability,
          actorId,
          'Unit updated',
        );
        await this.events.recordTimeline(
          tx,
          id,
          'AVAILABILITY_CHANGED',
          actorId,
          `${previousAvailability} → ${availability}`,
        );
      }
      // Sync old + new building (a move) and the property.
      const newBuildingId = dto.buildingId !== undefined ? dto.buildingId : previousBuildingId;
      if (previousBuildingId && previousBuildingId !== newBuildingId)
        await this.counts.syncBuilding(tx, previousBuildingId);
      await this.counts.syncForUnit(tx, existing.propertyId, newBuildingId ?? null);
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Unit',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  async archive(organizationId: string, id: string, actorId?: string): Promise<void> {
    const unit = await this.get(organizationId, id);
    if (unit.deletedAt) throw new ConflictException('Unit is already archived');
    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(
        id,
        { deletedAt: new Date(), availability: 'ARCHIVED', updatedBy: actorId ?? null },
        tx,
      );
      await this.events.recordTimeline(tx, id, 'ARCHIVED', actorId);
      await this.events.recordOccupancy(
        tx,
        id,
        unit.availability,
        'ARCHIVED',
        actorId,
        'Unit archived',
      );
      await this.counts.syncForUnit(tx, unit.propertyId, unit.buildingId);
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'ARCHIVE',
      entityType: 'Unit',
      entityId: id,
    });
  }

  async restore(organizationId: string, id: string, actorId?: string): Promise<Unit> {
    const unit = await this.get(organizationId, id);
    if (!unit.deletedAt) throw new ConflictException('Unit is not archived');
    const availability = this.availability.computeFor({
      deletedAt: null,
      isActive: unit.isActive,
      isReserved: unit.isReserved,
      isBlocked: unit.isBlocked,
    });
    await this.prisma.$transaction(async (tx) => {
      await this.repository.update(
        id,
        { deletedAt: null, availability, updatedBy: actorId ?? null },
        tx,
      );
      await this.events.recordTimeline(tx, id, 'RESTORED', actorId);
      await this.events.recordOccupancy(tx, id, 'ARCHIVED', availability, actorId, 'Unit restored');
      await this.counts.syncForUnit(tx, unit.propertyId, unit.buildingId);
    });
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'RESTORE',
      entityType: 'Unit',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  // ── helpers ──

  private async validateReferences(
    organizationId: string,
    dto: CreateUnitDto | UpdateUnitDto,
  ): Promise<void> {
    if (dto.propertyId && !(await this.properties.findById(organizationId, dto.propertyId, true))) {
      throw new BadRequestException(
        'propertyId does not reference a property in this organization',
      );
    }
    if (dto.unitTypeId && !(await this.config.findUnitType(organizationId, dto.unitTypeId))) {
      throw new BadRequestException(
        'unitTypeId does not reference a unit type in this organization',
      );
    }
    if (dto.statusId && !(await this.config.findUnitStatus(organizationId, dto.statusId))) {
      throw new BadRequestException(
        'statusId does not reference a unit status in this organization',
      );
    }
    if (dto.buildingId && !(await this.buildings.findById(organizationId, dto.buildingId, true))) {
      throw new BadRequestException(
        'buildingId does not reference a building in this organization',
      );
    }
    if (dto.floorId && !(await this.floors.findById(organizationId, dto.floorId))) {
      throw new BadRequestException('floorId does not reference a floor in this organization');
    }
    for (const featureId of dto.featureIds ?? []) {
      if (!(await this.config.findUnitFeature(organizationId, featureId))) {
        throw new BadRequestException(
          `featureId ${featureId} is not a unit feature in this organization`,
        );
      }
    }
  }

  private assignable(dto: UpdateUnitDto): Prisma.UnitUncheckedUpdateInput {
    const out: Record<string, unknown> = {};
    const keys: Array<keyof UpdateUnitDto> = [
      'buildingId',
      'floorId',
      'name',
      'description',
      'unitTypeId',
      'statusId',
      'isReserved',
      'isBlocked',
      'bedrooms',
      'bathrooms',
      'kitchens',
      'parkingSpaces',
      'size',
      'sizeUnit',
      'monthlyRent',
      'annualRent',
      'securityDeposit',
      'serviceCharge',
      'expectedAnnualRevenue',
      'marketValue',
      'ownerType',
      'ownerReferenceId',
      'latitude',
      'longitude',
      'isRentable',
    ];
    for (const key of keys) if (dto[key] !== undefined) out[key] = dto[key];
    return out;
  }

  private async uniqueSlug(organizationId: string, name: string): Promise<string> {
    const base = slugify(name) || 'unit';
    let slug = base;
    for (let i = 0; i < 6; i += 1) {
      if (!(await this.repository.findBySlug(organizationId, slug))) return slug;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    throw new ConflictException('Could not generate a unique slug; please adjust the unit name');
  }
}

function dedupe(ids: string[]): string[] {
  return Array.from(new Set(ids));
}
