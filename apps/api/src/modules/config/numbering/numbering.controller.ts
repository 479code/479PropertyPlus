import { Body, Controller, Get, Param, ParseEnumPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NumberedEntity, type NumberingSequence } from '@prisma/client';

import { ActorId, OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateNumberingSequenceDto } from './dto/create-numbering-sequence.dto';
import { UpdateNumberingSequenceDto } from './dto/update-numbering-sequence.dto';
import { type GeneratedNumber, NumberGeneratorService } from './number-generator.service';
import { NumberingService } from './numbering.service';

@ApiTags('Numbering')
@Controller('config/numbering')
export class NumberingController {
  constructor(
    private readonly service: NumberingService,
    private readonly generator: NumberGeneratorService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List numbering sequences for the organization' })
  list(@OrgId() organizationId: string): Promise<NumberingSequence[]> {
    return this.service.list(organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a numbering sequence' })
  create(
    @OrgId() organizationId: string,
    @Body() dto: CreateNumberingSequenceDto,
    @ActorId() actorId?: string,
  ): Promise<NumberingSequence> {
    return this.service.create(organizationId, dto, actorId);
  }

  @Patch(':entity')
  @ApiOperation({ summary: 'Update a numbering sequence' })
  update(
    @OrgId() organizationId: string,
    @Param('entity', new ParseEnumPipe(NumberedEntity)) entity: NumberedEntity,
    @Body() dto: UpdateNumberingSequenceDto,
    @ActorId() actorId?: string,
  ): Promise<NumberingSequence> {
    return this.service.update(organizationId, entity, dto, actorId);
  }

  @Post(':entity/next')
  @ApiOperation({ summary: 'Reserve and return the next number for an entity' })
  next(
    @OrgId() organizationId: string,
    @Param('entity', new ParseEnumPipe(NumberedEntity)) entity: NumberedEntity,
    @ActorId() actorId?: string,
  ): Promise<GeneratedNumber> {
    return this.generator.next(organizationId, entity, actorId);
  }
}
