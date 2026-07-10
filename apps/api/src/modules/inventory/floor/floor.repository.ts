import { Injectable } from '@nestjs/common';
import { type Floor } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface FloorCreateData {
  organizationId: string;
  buildingId: string;
  name: string;
  floorNumber?: number | null;
  description?: string | null;
  sortOrder?: number;
  createdBy?: string | null;
  updatedBy?: string | null;
}

@Injectable()
export class FloorRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: FloorCreateData): Promise<Floor> {
    return this.prisma.floor.create({ data: { ...data, sortOrder: data.sortOrder ?? 0 } });
  }
  listByBuilding(organizationId: string, buildingId: string): Promise<Floor[]> {
    return this.prisma.floor.findMany({
      where: { organizationId, buildingId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }
  findById(organizationId: string, id: string): Promise<Floor | null> {
    return this.prisma.floor.findFirst({ where: { id, organizationId, deletedAt: null } });
  }
  update(
    id: string,
    data: {
      name?: string;
      floorNumber?: number | null;
      description?: string | null;
      sortOrder?: number;
      updatedBy?: string | null;
    },
  ): Promise<Floor> {
    return this.prisma.floor.update({ where: { id }, data });
  }
  softDelete(id: string, actorId?: string): Promise<Floor> {
    return this.prisma.floor.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId ?? null },
    });
  }
  countByBuilding(organizationId: string, buildingId: string): Promise<number> {
    return this.prisma.floor.count({ where: { organizationId, buildingId, deletedAt: null } });
  }
}
