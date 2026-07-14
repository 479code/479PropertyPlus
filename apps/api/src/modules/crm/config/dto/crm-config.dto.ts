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

export class CreatePersonTypeDto {
  @ApiProperty({ example: 'Tenant' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdatePersonTypeDto extends PartialType(CreatePersonTypeDto) {}

export class CreatePersonTagDto {
  @ApiProperty({ example: 'VIP' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional({ example: '#f59e0b' }) @IsOptional() @IsHexColor() color?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdatePersonTagDto extends PartialType(CreatePersonTagDto) {}
