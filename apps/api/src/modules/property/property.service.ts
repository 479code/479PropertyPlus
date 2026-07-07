import { type Paginated } from '@479property/types';
import { paginate } from '@479property/utils';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Prisma, type Property } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NumberGeneratorService } from '../config/numbering/number-generator.service';
import { GeoRepository } from '../geo/geo.repository';

import { PropertyConfigRepository } from './config/property-config.repository';
import { type CreatePropertyDto, type UpdatePropertyDto } from './dto/create-property.dto';
import { type SearchPropertyDto } from './dto/search-property.dto';
import { PropertyRepository } from './property.repository';
import { slugify } from './slug.util';

export interface PropertyDashboard {
  totalProperties: number;
  archivedProperties: number;
  byStatus: Array<{ statusId: string; name: string; count: number }>;
  byType: Array<{ propertyTypeId: string; name: string; count: number }>;
  totalMarketValue: number;
  totalExpectedRevenue: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
}

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: PropertyRepository,
    private readonly config: PropertyConfigRepository,
    private readonly geo: GeoRepository,
    private readonly numbers: NumberGeneratorService,
    private readonly audit: AuditService,
  ) {}

  async get(organizationId: string, id: string, includeArchived = false): Promise<Property> {
    const property = await this.repository.findById(organizationId, id, includeArchived);
    if (!property) throw new NotFoundException(`Property ${id} not found`);
    return property;
  }

  async search(organizationId: string, dto: SearchPropertyDto): Promise<Paginated<Property>> {
    const where = this.repository.buildWhere({
      organizationId,
      includeArchived: dto.includeArchived,
      code: dto.code,
      name: dto.name,
      address: dto.address,
      countryId: dto.countryId,
      stateId: dto.stateId,
      cityId: dto.cityId,
      districtId: dto.districtId,
      areaId: dto.areaId,
      propertyTypeId: dto.propertyTypeId,
      statusId: dto.statusId,
      googlePlaceId: dto.googlePlaceId,
      isActive: dto.isActive,
      featureIds: dto.featureIds,
      tagIds: dto.tagIds,
      purchasePriceMin: dto.purchasePriceMin,
      purchasePriceMax: dto.purchasePriceMax,
      marketValueMin: dto.marketValueMin,
      marketValueMax: dto.marketValueMax,
      revenueMin: dto.revenueMin,
      revenueMax: dto.revenueMax,
    });
    const orderBy = { [dto.sortBy]: dto.sortOrder } as Prisma.PropertyOrderByWithRelationInput;
    const [items, total] = await this.repository.search(
      where,
      orderBy,
      (dto.page - 1) * dto.pageSize,
      dto.pageSize,
    );
    return paginate(items, total, { page: dto.page, pageSize: dto.pageSize });
  }

  async create(
    organizationId: string,
    dto: CreatePropertyDto,
    actorId?: string,
  ): Promise<Property> {
    await this.validateReferences(organizationId, dto);

    const propertyCode = await this.resolveCode(organizationId, dto.propertyCode, actorId);
    if (await this.repository.findByCode(organizationId, propertyCode)) {
      throw new ConflictException(`Property code ${propertyCode} is already in use`);
    }
    const slug = await this.uniqueSlug(organizationId, dto.name);

    const data = this.toCreateData(organizationId, propertyCode, slug, dto, actorId);

    const property = await this.prisma.$transaction(async (tx) => {
      const created = await this.repository.create(data, tx);
      if (dto.featureIds?.length)
        await this.repository.replaceFeatures(tx, created.id, dedupe(dto.featureIds));
      if (dto.tagIds?.length) await this.repository.replaceTags(tx, created.id, dedupe(dto.tagIds));
      return created;
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'CREATE',
      entityType: 'Property',
      entityId: property.id,
      description: `Created property ${propertyCode}`,
    });
    return this.get(organizationId, property.id);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdatePropertyDto,
    actorId?: string,
  ): Promise<Property> {
    await this.get(organizationId, id, true);
    await this.validateReferences(organizationId, dto);

    const data: Prisma.PropertyUncheckedUpdateInput = {
      ...this.toUpdateData(dto),
      updatedBy: actorId,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.property.update({ where: { id }, data });
      if (dto.featureIds) {
        await this.repository.clearFeatures(tx, id);
        if (dto.featureIds.length)
          await this.repository.replaceFeatures(tx, id, dedupe(dto.featureIds));
      }
      if (dto.tagIds) {
        await this.repository.clearTags(tx, id);
        if (dto.tagIds.length) await this.repository.replaceTags(tx, id, dedupe(dto.tagIds));
      }
    });

    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Property',
      entityId: id,
    });
    return this.get(organizationId, id, true);
  }

  async archive(organizationId: string, id: string, actorId?: string): Promise<void> {
    const property = await this.get(organizationId, id, true);
    if (property.deletedAt) throw new ConflictException('Property is already archived');
    await this.repository.setDeletedAt(id, new Date(), actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'ARCHIVE',
      entityType: 'Property',
      entityId: id,
    });
  }

  async restore(organizationId: string, id: string, actorId?: string): Promise<Property> {
    const property = await this.get(organizationId, id, true);
    if (!property.deletedAt) throw new ConflictException('Property is not archived');
    await this.repository.setDeletedAt(id, null, actorId);
    await this.audit.record({
      organizationId,
      userId: actorId,
      action: 'RESTORE',
      entityType: 'Property',
      entityId: id,
    });
    return this.get(organizationId, id);
  }

  async dashboard(organizationId: string): Promise<PropertyDashboard> {
    const [total, archived, byStatusRaw, byTypeRaw, agg, statuses, types] = await Promise.all([
      this.repository.countByOrg(organizationId, null),
      this.repository.countByOrg(organizationId, { not: null }),
      this.repository.groupByStatus(organizationId),
      this.repository.groupByType(organizationId),
      this.repository.aggregate(organizationId),
      this.config.listStatuses(organizationId),
      this.config.listTypes(organizationId),
    ]);

    const statusName = new Map(statuses.map((s) => [s.id, s.name]));
    const typeName = new Map(types.map((t) => [t.id, t.name]));
    const totalUnits = num(agg._sum.totalUnits);
    const occupiedUnits = num(agg._sum.occupiedUnits);

    return {
      totalProperties: total,
      archivedProperties: archived,
      byStatus: byStatusRaw.map((r) => ({
        statusId: r.statusId,
        name: statusName.get(r.statusId) ?? 'Unknown',
        count: r._count,
      })),
      byType: byTypeRaw.map((r) => ({
        propertyTypeId: r.propertyTypeId,
        name: typeName.get(r.propertyTypeId) ?? 'Unknown',
        count: r._count,
      })),
      totalMarketValue: num(agg._sum.marketValue),
      totalExpectedRevenue: num(agg._sum.expectedAnnualRevenue),
      totalUnits,
      occupiedUnits,
      vacantUnits: Math.max(totalUnits - occupiedUnits, 0),
      occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0,
    };
  }

  // ── helpers ──

  private async validateReferences(
    organizationId: string,
    dto: CreatePropertyDto | UpdatePropertyDto,
  ): Promise<void> {
    if (dto.propertyTypeId && !(await this.config.findType(organizationId, dto.propertyTypeId))) {
      throw new BadRequestException(
        'propertyTypeId does not reference a property type in this organization',
      );
    }
    if (dto.statusId && !(await this.config.findStatus(organizationId, dto.statusId))) {
      throw new BadRequestException(
        'statusId does not reference a property status in this organization',
      );
    }
    if (dto.countryId && !(await this.geo.findCountry(dto.countryId)))
      throw new BadRequestException('Invalid countryId');
    if (dto.stateId && !(await this.geo.findState(dto.stateId)))
      throw new BadRequestException('Invalid stateId');
    if (dto.cityId && !(await this.geo.findCity(dto.cityId)))
      throw new BadRequestException('Invalid cityId');
    if (dto.districtId && !(await this.geo.findDistrict(dto.districtId)))
      throw new BadRequestException('Invalid districtId');
    if (dto.areaId && !(await this.geo.findArea(dto.areaId)))
      throw new BadRequestException('Invalid areaId');
    for (const featureId of dto.featureIds ?? []) {
      if (!(await this.config.findFeature(organizationId, featureId))) {
        throw new BadRequestException(
          `featureId ${featureId} is not a feature in this organization`,
        );
      }
    }
    for (const tagId of dto.tagIds ?? []) {
      if (!(await this.config.findTag(organizationId, tagId))) {
        throw new BadRequestException(`tagId ${tagId} is not a tag in this organization`);
      }
    }
  }

  private async resolveCode(
    organizationId: string,
    override: string | undefined,
    actorId?: string,
  ): Promise<string> {
    if (override && override.trim()) return override.trim();
    const generated = await this.numbers.next(organizationId, 'PROPERTY', actorId);
    return generated.formatted;
  }

  private async uniqueSlug(organizationId: string, name: string): Promise<string> {
    const base = slugify(name) || 'property';
    let slug = base;
    for (let i = 0; i < 6; i += 1) {
      if (!(await this.repository.findBySlug(organizationId, slug))) return slug;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    throw new ForbiddenException(
      'Could not generate a unique slug; please adjust the property name',
    );
  }

  private toCreateData(
    organizationId: string,
    propertyCode: string,
    slug: string,
    dto: CreatePropertyDto,
    actorId?: string,
  ): Prisma.PropertyUncheckedCreateInput {
    const totalUnits = dto.totalUnits ?? 0;
    const occupiedUnits = dto.occupiedUnits ?? 0;
    return {
      organizationId,
      propertyCode,
      slug,
      name: dto.name,
      description: dto.description ?? null,
      propertyTypeId: dto.propertyTypeId,
      statusId: dto.statusId,
      countryId: dto.countryId ?? null,
      stateId: dto.stateId ?? null,
      cityId: dto.cityId ?? null,
      districtId: dto.districtId ?? null,
      areaId: dto.areaId ?? null,
      streetAddress: dto.streetAddress ?? null,
      postalCode: dto.postalCode ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      polygon: (dto.polygon ?? undefined) as Prisma.InputJsonValue | undefined,
      geoJson: (dto.geoJson ?? undefined) as Prisma.InputJsonValue | undefined,
      googlePlaceId: dto.googlePlaceId ?? null,
      yearBuilt: dto.yearBuilt ?? null,
      purchaseDate: dto.purchaseDate ?? null,
      purchasePrice: dto.purchasePrice ?? null,
      marketValue: dto.marketValue ?? null,
      expectedAnnualRevenue: dto.expectedAnnualRevenue ?? null,
      ownerType: dto.ownerType ?? null,
      ownerReferenceId: dto.ownerReferenceId ?? null,
      totalBuildings: dto.totalBuildings ?? 0,
      totalUnits,
      occupiedUnits,
      vacantUnits: Math.max(totalUnits - occupiedUnits, 0),
      createdBy: actorId ?? null,
      updatedBy: actorId ?? null,
    };
  }

  private toUpdateData(dto: UpdatePropertyDto): Prisma.PropertyUncheckedUpdateInput {
    const data: Record<string, unknown> = {};
    const assignable: Array<keyof UpdatePropertyDto> = [
      'name',
      'description',
      'propertyTypeId',
      'statusId',
      'countryId',
      'stateId',
      'cityId',
      'districtId',
      'areaId',
      'streetAddress',
      'postalCode',
      'latitude',
      'longitude',
      'googlePlaceId',
      'yearBuilt',
      'purchaseDate',
      'purchasePrice',
      'marketValue',
      'expectedAnnualRevenue',
      'ownerType',
      'ownerReferenceId',
      'totalBuildings',
    ];
    for (const key of assignable) {
      if (dto[key] !== undefined) data[key] = dto[key];
    }
    if (dto.polygon !== undefined) data.polygon = dto.polygon as Prisma.InputJsonValue;
    if (dto.geoJson !== undefined) data.geoJson = dto.geoJson as Prisma.InputJsonValue;
    if (dto.totalUnits !== undefined || dto.occupiedUnits !== undefined) {
      const totalUnits = dto.totalUnits ?? 0;
      const occupiedUnits = dto.occupiedUnits ?? 0;
      if (dto.totalUnits !== undefined) data.totalUnits = totalUnits;
      if (dto.occupiedUnits !== undefined) data.occupiedUnits = occupiedUnits;
      data.vacantUnits = Math.max(totalUnits - occupiedUnits, 0);
    }
    return data;
  }
}

function dedupe(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

function num(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const n = Number((value as { toString(): string }).toString());
  return Number.isFinite(n) ? n : 0;
}
