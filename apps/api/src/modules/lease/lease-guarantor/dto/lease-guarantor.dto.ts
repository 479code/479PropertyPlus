import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min, MaxLength } from 'class-validator';

export class AddLeaseGuarantorDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() personId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) guaranteeType?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  guaranteeAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) relationshipToTenant?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}

export class UpdateLeaseGuarantorDto extends PartialType(AddLeaseGuarantorDto) {}
