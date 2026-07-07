import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export enum DocumentTypeDto {
  TITLE = 'TITLE',
  SURVEY = 'SURVEY',
  CERTIFICATE = 'CERTIFICATE',
  INSURANCE = 'INSURANCE',
  BUILDING_PLAN = 'BUILDING_PLAN',
  UTILITY = 'UTILITY',
  PURCHASE_AGREEMENT = 'PURCHASE_AGREEMENT',
  LEASE = 'LEASE',
  OTHER = 'OTHER',
}

export class CreatePropertyDocumentDto {
  @ApiProperty({ enum: DocumentTypeDto })
  @IsEnum(DocumentTypeDto)
  documentType!: DocumentTypeDto;

  @ApiProperty({ example: 'Certificate of Occupancy' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'https://cdn.example.com/docs/co.pdf' })
  @IsUrl()
  @MaxLength(1000)
  url!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
}
export class UpdatePropertyDocumentDto extends PartialType(CreatePropertyDocumentDto) {}
