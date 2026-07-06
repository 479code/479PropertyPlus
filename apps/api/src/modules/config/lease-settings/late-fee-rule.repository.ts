import { Injectable } from '@nestjs/common';
import { type LateFeeRule } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { type CreateLateFeeRuleDto } from './dto/create-late-fee-rule.dto';
import { type UpdateLateFeeRuleDto } from './dto/update-late-fee-rule.dto';

@Injectable()
export class LateFeeRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    organizationId: string,
    data: CreateLateFeeRuleDto,
    actorId?: string,
  ): Promise<LateFeeRule> {
    return this.prisma.lateFeeRule.create({
      data: { organizationId, ...data, createdBy: actorId },
    });
  }

  findById(organizationId: string, id: string): Promise<LateFeeRule | null> {
    return this.prisma.lateFeeRule.findFirst({ where: { id, organizationId, deletedAt: null } });
  }

  findMany(organizationId: string): Promise<LateFeeRule[]> {
    return this.prisma.lateFeeRule.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  update(id: string, data: UpdateLateFeeRuleDto & { updatedBy?: string }): Promise<LateFeeRule> {
    return this.prisma.lateFeeRule.update({ where: { id }, data });
  }

  softDelete(id: string, updatedBy?: string): Promise<LateFeeRule> {
    return this.prisma.lateFeeRule.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy },
    });
  }
}
