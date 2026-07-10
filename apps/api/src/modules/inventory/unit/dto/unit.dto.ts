import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum UnitOwnerTypeDto {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  GOVERNMENT = 'GOVERNMENT',
  TRUST = 'TRUST',
  OTHER = 'OTHER',
}

export class CreateUnitDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() propertyId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() buildingId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() floorId?: string;

  @ApiProperty({ example: 'Apartment 1B' }) @IsString() @MaxLength(160) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ description: 'Override auto-generated unit code' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  unitCode?: string;

  @ApiProperty({ format: 'uuid' }) @IsUUID() unitTypeId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() statusId!: string;

  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isReserved?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isBlocked?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) bedrooms?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) bathrooms?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) kitchens?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) parkingSpaces?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) size?: number;
  @ApiPropertyOptional({ example: 'sqm' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  sizeUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualRent?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  securityDeposit?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  serviceCharge?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  expectedAnnualRevenue?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marketValue?: number;

  @ApiPropertyOptional({ enum: UnitOwnerTypeDto })
  @IsOptional()
  @IsEnum(UnitOwnerTypeDto)
  ownerType?: UnitOwnerTypeDto;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerReferenceId?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?: number;

  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isRentable?: boolean;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  featureIds?: string[];
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}

const SORTABLE = ['createdAt', 'name', 'unitCode', 'monthlyRent', 'bedrooms'] as const;
type Sortable = (typeof SORTABLE)[number];
const AVAILABILITY = [
  'ARCHIVED',
  'INACTIVE',
  'OCCUPIED',
  'RESERVED',
  'UNDER_MAINTENANCE',
  'BLOCKED',
  'AVAILABLE',
] as const;

function toBool(v: unknown): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  return v === 'true' || v === true;
}
function toArray(v: unknown): string[] | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  return Array.isArray(v) ? (v as string[]) : String(v).split(',').filter(Boolean);
}

export class SearchUnitDto {
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ description: 'Global search across code/name/description' })
  @IsOptional()
  @IsString()
  q?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() propertyId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() buildingId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() floorId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() unitTypeId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() statusId?: string;
  @ApiPropertyOptional({ enum: AVAILABILITY })
  @IsOptional()
  @IsIn(AVAILABILITY as unknown as string[])
  availability?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) bedrooms?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) bathrooms?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() rentMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() rentMax?: number;
  @ApiPropertyOptional({ description: 'Comma-separated feature ids' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  featureIds?: string[];
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  includeArchived?: boolean;

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
