import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateLeaseTypeDto {
  @ApiProperty({ example: 'Residential' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateLeaseTypeDto extends PartialType(CreateLeaseTypeDto) {}

export class CreatePaymentFrequencyDto {
  @ApiProperty({ example: 'Monthly' }) @IsString() @MaxLength(80) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdatePaymentFrequencyDto extends PartialType(CreatePaymentFrequencyDto) {}

/**
 * LeaseStatus is a system-backed config table: `key` and the two business
 * flags (blocksUnitAvailability/countsAsOccupancy) are structural (drive the
 * state machine + occupancy engine), so they are NOT exposed for editing —
 * only display fields (name/color/description/displayOrder/isActive) can be
 * customized per org.
 */
export class UpdateLeaseStatusDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
