import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum LeaseDocumentTypeDto {
  LEASE_AGREEMENT = 'LEASE_AGREEMENT',
  SIGNED_CONTRACT = 'SIGNED_CONTRACT',
  ADDENDUM = 'ADDENDUM',
  IDENTITY_DOCUMENT = 'IDENTITY_DOCUMENT',
  INSPECTION_REPORT = 'INSPECTION_REPORT',
  HANDOVER_REPORT = 'HANDOVER_REPORT',
  OTHER = 'OTHER',
}

export class CreateLeaseDocumentDto {
  @ApiProperty({ enum: LeaseDocumentTypeDto })
  @IsEnum(LeaseDocumentTypeDto)
  documentType!: LeaseDocumentTypeDto;
  @ApiProperty({ example: 'Signed Lease Agreement' }) @IsString() @MaxLength(200) name!: string;
  @ApiProperty({ example: 'https://cdn.example.com/lease.pdf' })
  @IsString()
  @MaxLength(1000)
  url!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
}

export class UpdateLeaseDocumentDto extends PartialType(CreateLeaseDocumentDto) {}
