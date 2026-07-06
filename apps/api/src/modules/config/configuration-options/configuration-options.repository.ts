import { Injectable } from '@nestjs/common';
import { type ConfigurationCategory, type ConfigurationOption, type Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface OptionCreateData {
  organizationId: string;
  category: ConfigurationCategory;
  key: string;
  label: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  metadata?: unknown;
  createdBy?: string;
}

@Injectable()
export class ConfigurationOptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: OptionCreateData): Promise<ConfigurationOption> {
    return this.prisma.configurationOption.create({
      data: {
        ...data,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  findById(organizationId: string, id: string): Promise<ConfigurationOption | null> {
    return this.prisma.configurationOption.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
  }

  findByKey(
    organizationId: string,
    category: ConfigurationCategory,
    key: string,
  ): Promise<ConfigurationOption | null> {
    return this.prisma.configurationOption.findFirst({
      where: { organizationId, category, key, deletedAt: null },
    });
  }

  findManyAndCount(
    where: Record<string, unknown>,
    skip: number,
    take: number,
  ): Promise<[ConfigurationOption[], number]> {
    return Promise.all([
      this.prisma.configurationOption.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      }),
      this.prisma.configurationOption.count({ where }),
    ]);
  }

  update(
    id: string,
    data: Partial<OptionCreateData> & { updatedBy?: string },
  ): Promise<ConfigurationOption> {
    return this.prisma.configurationOption.update({
      where: { id },
      data: {
        ...data,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  softDelete(id: string, updatedBy?: string): Promise<ConfigurationOption> {
    return this.prisma.configurationOption.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy },
    });
  }
}
