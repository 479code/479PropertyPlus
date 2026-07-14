import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export enum LeaseTenantRoleDto {
  PRIMARY = 'PRIMARY',
  CO_TENANT = 'CO_TENANT',
  OCCUPANT = 'OCCUPANT',
  AUTHORIZED_REPRESENTATIVE = 'AUTHORIZED_REPRESENTATIVE',
}

export class AddLeaseTenantDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() personId!: string;
  @ApiPropertyOptional({ enum: LeaseTenantRoleDto, default: LeaseTenantRoleDto.CO_TENANT })
  @IsOptional()
  @IsEnum(LeaseTenantRoleDto)
  role?: LeaseTenantRoleDto;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  ownershipPercentage?: number;
}

export class UpdateLeaseTenantDto extends PartialType(AddLeaseTenantDto) {}
