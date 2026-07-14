import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
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

export class UpsertTenantProfileDto {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) employmentStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) employer?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyIncome?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) preferredPaymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) preferredCommunication?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) riskRating?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(999) creditScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) status?: string;
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Suggested default guarantor for future lease creation (not an active guarantee)',
  })
  @IsOptional()
  @IsUUID()
  defaultGuarantorPersonId?: string;
}
export class PatchTenantProfileDto extends PartialType(UpsertTenantProfileDto) {}

export class UpsertAgentProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) agencyName?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  commissionRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) licenceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) territory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
export class PatchAgentProfileDto extends PartialType(UpsertAgentProfileDto) {}

export class UpsertOwnerProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) ownershipType?: string;
  @ApiPropertyOptional({
    description:
      'Non-sensitive bank metadata only, e.g. { bankName, accountName } — never full account numbers',
  })
  @IsOptional()
  @IsObject()
  bankDetails?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) payoutPreference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}
export class PatchOwnerProfileDto extends PartialType(UpsertOwnerProfileDto) {}
