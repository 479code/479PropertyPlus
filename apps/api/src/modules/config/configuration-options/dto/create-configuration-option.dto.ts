import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConfigurationCategory } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateConfigurationOptionDto {
  @ApiProperty({ enum: ConfigurationCategory })
  @IsEnum(ConfigurationCategory)
  category!: ConfigurationCategory;

  @ApiProperty({
    example: 'apartment',
    description: 'Stable machine key (lowercase, unique per category).',
  })
  @IsString()
  @Matches(/^[a-z0-9_]+$/, { message: 'key must be lowercase alphanumeric/underscore' })
  @MaxLength(60)
  key!: string;

  @ApiProperty({ example: 'Apartment' })
  @IsString()
  @MaxLength(120)
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '#2563eb' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

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
