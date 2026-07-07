import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

const SORTABLE = [
  'createdAt',
  'name',
  'propertyCode',
  'marketValue',
  'purchasePrice',
  'expectedAnnualRevenue',
] as const;
type Sortable = (typeof SORTABLE)[number];

function toBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === 'true' || value === true;
}

function toArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return Array.isArray(value) ? (value as string[]) : String(value).split(',').filter(Boolean);
}

export class SearchPropertyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;

  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() countryId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() stateId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() cityId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() districtId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() areaId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() propertyTypeId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() statusId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() googlePlaceId?: string;

  @ApiPropertyOptional({ description: 'Comma-separated feature ids (property must have all)' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  featureIds?: string[];

  @ApiPropertyOptional({ description: 'Comma-separated tag ids (property must have any)' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  isActive?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  includeArchived?: boolean;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() purchasePriceMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() purchasePriceMax?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() marketValueMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() marketValueMax?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() revenueMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() revenueMax?: number;

  @ApiPropertyOptional({ enum: SORTABLE, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE as unknown as string[])
  sortBy: Sortable = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
