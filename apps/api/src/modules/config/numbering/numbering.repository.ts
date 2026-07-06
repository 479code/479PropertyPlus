import { Injectable } from '@nestjs/common';
import { type NumberedEntity, type NumberingSequence } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { type CreateNumberingSequenceDto } from './dto/create-numbering-sequence.dto';
import { type UpdateNumberingSequenceDto } from './dto/update-numbering-sequence.dto';

@Injectable()
export class NumberingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByOrg(organizationId: string): Promise<NumberingSequence[]> {
    return this.prisma.numberingSequence.findMany({
      where: { organizationId },
      orderBy: { entity: 'asc' },
    });
  }

  findByEntity(organizationId: string, entity: NumberedEntity): Promise<NumberingSequence | null> {
    return this.prisma.numberingSequence.findUnique({
      where: { organizationId_entity: { organizationId, entity } },
    });
  }

  create(
    organizationId: string,
    data: CreateNumberingSequenceDto,
    actorId?: string,
  ): Promise<NumberingSequence> {
    return this.prisma.numberingSequence.create({
      data: { organizationId, ...data, createdBy: actorId, updatedBy: actorId },
    });
  }

  update(
    id: string,
    data: UpdateNumberingSequenceDto & { updatedBy?: string },
  ): Promise<NumberingSequence> {
    return this.prisma.numberingSequence.update({ where: { id }, data });
  }
}
