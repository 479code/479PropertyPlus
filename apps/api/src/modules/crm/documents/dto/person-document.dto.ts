import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum PersonDocumentTypeDto {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVERS_LICENCE = 'DRIVERS_LICENCE',
  UTILITY_BILL = 'UTILITY_BILL',
  EMPLOYMENT_LETTER = 'EMPLOYMENT_LETTER',
  COMPANY_REGISTRATION = 'COMPANY_REGISTRATION',
  TAX_CERTIFICATE = 'TAX_CERTIFICATE',
  OTHER = 'OTHER',
}

export class CreatePersonDocumentDto {
  @ApiProperty({ enum: PersonDocumentTypeDto })
  @IsEnum(PersonDocumentTypeDto)
  documentType!: PersonDocumentTypeDto;
  @ApiProperty({ example: 'International Passport' }) @IsString() @MaxLength(200) name!: string;
  @ApiProperty({ example: 'https://cdn.example.com/passport.pdf' })
  @IsString()
  @MaxLength(1000)
  url!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
}

export class UpdatePersonDocumentDto extends PartialType(CreatePersonDocumentDto) {}
