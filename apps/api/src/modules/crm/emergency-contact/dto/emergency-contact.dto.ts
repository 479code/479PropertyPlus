import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min, MaxLength } from 'class-validator';

export class CreateEmergencyContactDto {
  @ApiProperty({
    format: 'uuid',
    description: 'The Person being designated as the emergency contact',
  })
  @IsUUID()
  contactPersonId!: string;

  @ApiProperty({ example: 'Spouse' }) @IsString() @MaxLength(80) relationship!: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) priority?: number;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isPrimary?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

export class UpdateEmergencyContactDto extends PartialType(CreateEmergencyContactDto) {}
