import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUnitImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/u/1.jpg' })
  @IsUrl()
  @MaxLength(1000)
  url!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) caption?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class UpdateUnitImageDto extends PartialType(CreateUnitImageDto) {}

export enum UnitDocumentTypeDto {
  FLOOR_PLAN = 'FLOOR_PLAN',
  INSPECTION_REPORT = 'INSPECTION_REPORT',
  WARRANTY = 'WARRANTY',
  CERTIFICATE = 'CERTIFICATE',
  MAINTENANCE_MANUAL = 'MAINTENANCE_MANUAL',
  OTHER = 'OTHER',
}

export class CreateUnitDocumentDto {
  @ApiProperty({ enum: UnitDocumentTypeDto })
  @IsEnum(UnitDocumentTypeDto)
  documentType!: UnitDocumentTypeDto;
  @ApiProperty({ example: 'Floor Plan A' }) @IsString() @MaxLength(200) name!: string;
  @ApiProperty({ example: 'https://cdn.example.com/docs/plan.pdf' })
  @IsUrl()
  @MaxLength(1000)
  url!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
}
export class UpdateUnitDocumentDto extends PartialType(CreateUnitDocumentDto) {}
