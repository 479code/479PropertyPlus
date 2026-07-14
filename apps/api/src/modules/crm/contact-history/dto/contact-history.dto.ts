import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ContactHistoryTypeDto {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export class CreateContactHistoryDto {
  @ApiProperty({ enum: ContactHistoryTypeDto })
  @IsEnum(ContactHistoryTypeDto)
  type!: ContactHistoryTypeDto;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @ApiPropertyOptional({ description: 'Defaults to now if omitted' })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
