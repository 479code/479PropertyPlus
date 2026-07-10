import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() propertyId!: string;
  @ApiProperty({ example: 'Block A' }) @IsString() @MaxLength(160) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;

  @ApiPropertyOptional({ description: 'Override auto-generated building code' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  buildingCode?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) numberOfFloors?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1800) @Max(2100) yearBuilt?: number;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() statusId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?: number;
}

export class UpdateBuildingDto extends PartialType(CreateBuildingDto) {}

export class ListBuildingQueryDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() propertyId?: string;
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
