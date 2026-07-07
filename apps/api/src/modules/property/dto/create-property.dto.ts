import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum PropertyOwnerTypeDto {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  GOVERNMENT = 'GOVERNMENT',
  TRUST = 'TRUST',
  OTHER = 'OTHER',
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Prime Estate Phase 1' })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;

  @ApiProperty({ format: 'uuid' }) @IsUUID() propertyTypeId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() statusId!: string;

  @ApiPropertyOptional({
    description: 'Override the auto-generated property code (requires permission)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  propertyCode?: string;

  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() countryId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() stateId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() cityId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() districtId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() areaId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) streetAddress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) postalCode?: string;

  @ApiPropertyOptional({ example: 6.5244 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;
  @ApiPropertyOptional({ example: 3.3792 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  polygon?: Record<string, unknown>;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  geoJson?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) googlePlaceId?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1800) @Max(2100) yearBuilt?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) purchaseDate?: Date;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchasePrice?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marketValue?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  expectedAnnualRevenue?: number;

  @ApiPropertyOptional({ enum: PropertyOwnerTypeDto })
  @IsOptional()
  @IsEnum(PropertyOwnerTypeDto)
  ownerType?: PropertyOwnerTypeDto;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerReferenceId?: string;

  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) totalBuildings?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) totalUnits?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) occupiedUnits?: number;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  featureIds?: string[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
