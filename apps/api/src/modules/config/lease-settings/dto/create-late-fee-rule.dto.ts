import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LateFeeType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLateFeeRuleDto {
  @ApiProperty({ example: 'Standard late fee' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: LateFeeType })
  @IsEnum(LateFeeType)
  feeType!: LateFeeType;

  @ApiProperty({
    example: 25,
    description: 'Fixed amount, or percentage (0-100) when feeType=PERCENTAGE',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  applyAfterDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
