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

export class CreatePropertyTypeDto {
  @ApiProperty({ example: 'Residential' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) icon?: string;
  @ApiPropertyOptional({ example: '#2563eb' }) @IsOptional() @IsHexColor() color?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdatePropertyTypeDto extends PartialType(CreatePropertyTypeDto) {}

export class CreatePropertyStatusDto {
  @ApiProperty({ example: 'Active' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: '#16a34a' }) @IsOptional() @IsHexColor() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdatePropertyStatusDto extends PartialType(CreatePropertyStatusDto) {}

export class CreatePropertyFeatureDto {
  @ApiProperty({ example: 'Swimming Pool' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) icon?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdatePropertyFeatureDto extends PartialType(CreatePropertyFeatureDto) {}

export class CreatePropertyTagDto {
  @ApiProperty({ example: 'Luxury' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: '#a855f7' }) @IsOptional() @IsHexColor() color?: string;
}
export class UpdatePropertyTagDto extends PartialType(CreatePropertyTagDto) {}
