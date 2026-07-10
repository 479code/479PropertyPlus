import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBuildingStatusDto {
  @ApiProperty({ example: 'Active' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional({ example: '#16a34a' }) @IsOptional() @IsHexColor() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateBuildingStatusDto extends PartialType(CreateBuildingStatusDto) {}

export class CreateUnitTypeDto {
  @ApiProperty({ example: 'Apartment' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) icon?: string;
  @ApiPropertyOptional({ example: '#2563eb' }) @IsOptional() @IsHexColor() color?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateUnitTypeDto extends PartialType(CreateUnitTypeDto) {}

export class CreateUnitStatusDto {
  @ApiProperty({ example: 'Available' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional({ example: '#16a34a' }) @IsOptional() @IsHexColor() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateUnitStatusDto extends PartialType(CreateUnitStatusDto) {}

export class CreateUnitFeatureDto {
  @ApiProperty({ example: 'Balcony' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) icon?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateUnitFeatureDto extends PartialType(CreateUnitFeatureDto) {}
