import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NumberedEntity, SequenceResetPolicy } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNumberingSequenceDto {
  @ApiProperty({ enum: NumberedEntity })
  @IsEnum(NumberedEntity)
  entity!: NumberedEntity;

  @ApiPropertyOptional({ default: '', example: 'PROP' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  prefix?: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  suffix?: string;

  @ApiPropertyOptional({ default: 6, minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  padding?: number;

  @ApiPropertyOptional({ default: '-' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  separator?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  includeYear?: boolean;

  @ApiPropertyOptional({ enum: SequenceResetPolicy, default: 'NEVER' })
  @IsOptional()
  @IsEnum(SequenceResetPolicy)
  resetPolicy?: SequenceResetPolicy;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
