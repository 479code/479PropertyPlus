import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLeaseDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() propertyId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() buildingId?: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() unitId!: string;
  @ApiProperty({ format: 'uuid', description: 'The primary tenant (a Person)' })
  @IsUUID()
  primaryTenantId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() leaseTypeId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() paymentFrequencyId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) leaseReference?: string;

  @ApiProperty() @IsDateString() leaseStartDate!: string;
  @ApiProperty() @IsDateString() leaseEndDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() moveInDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() moveOutDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) leaseDurationMonths?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) renewalNoticeDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) gracePeriodDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  securityDeposit?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualRent?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  serviceCharge?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  utilityCharge?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  parkingCharge?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) discount?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalRecurringAmount?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) billingCycle?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextInvoiceDate?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() autoRenew?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) notes?: string;

  @ApiPropertyOptional({
    type: [Object],
    description:
      'Additional tenants beyond the primary tenant, e.g. [{ personId, role, ownershipPercentage }]',
  })
  @IsOptional()
  @IsArray()
  additionalTenants?: Array<{ personId: string; role?: string; ownershipPercentage?: number }>;

  @ApiPropertyOptional({
    type: [Object],
    description:
      'Guarantors, e.g. [{ personId, guaranteeType, guaranteeAmount, relationshipToTenant }]',
  })
  @IsOptional()
  @IsArray()
  guarantors?: Array<{
    personId: string;
    guaranteeType?: string;
    guaranteeAmount?: number;
    relationshipToTenant?: string;
  }>;
}

export class UpdateLeaseDto extends PartialType(CreateLeaseDto) {}

export class SearchLeaseDto {
  @ApiPropertyOptional() @IsOptional() @IsString() leaseNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tenantName?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() propertyId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() buildingId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() unitId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() leaseStatusId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() leaseTypeId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() paymentFrequencyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDateFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDateTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDateFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDateTo?: string;
  @ApiPropertyOptional({
    description:
      'Leases with leaseEndDate within the next N days that are still Active/Renewal Pending',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expiringInDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() q?: string;
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeArchived?: boolean;

  @ApiPropertyOptional({
    enum: ['createdAt', 'leaseNumber', 'leaseStartDate', 'leaseEndDate', 'monthlyRent'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'leaseNumber', 'leaseStartDate', 'leaseEndDate', 'monthlyRent'])
  sortBy: 'createdAt' | 'leaseNumber' | 'leaseStartDate' | 'leaseEndDate' | 'monthlyRent' =
    'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

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

export class TransitionLeaseDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) reason?: string;
}

export class TerminateLeaseDto {
  @ApiProperty() @IsDateString() terminationDate!: string;
  @ApiProperty() @IsString() @MaxLength(1000) terminationReason!: string;
}
