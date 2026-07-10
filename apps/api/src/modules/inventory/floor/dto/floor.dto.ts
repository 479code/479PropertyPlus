import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateFloorDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() buildingId!: string;
  @ApiProperty({ example: 'Ground Floor' }) @IsString() @MaxLength(120) name!: string;
  @ApiPropertyOptional({ example: 0 }) @IsOptional() @IsInt() floorNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class UpdateFloorDto extends PartialType(CreateFloorDto) {}
