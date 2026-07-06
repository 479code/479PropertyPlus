import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateOrganizationSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) logoUrl?: string;
  @ApiPropertyOptional({ example: 'light' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  theme?: string;
  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;
  @ApiPropertyOptional({ example: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
  @ApiPropertyOptional({ example: 'en' }) @IsOptional() @IsString() @MaxLength(8) language?: string;
  @ApiPropertyOptional({ example: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  dateFormat?: string;
  @ApiPropertyOptional({ example: 'HH:mm' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  timeFormat?: string;
  @ApiPropertyOptional({ example: '1,234.56' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  numberFormat?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  fiscalYearStartMonth?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 31 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  fiscalYearStartDay?: number;

  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3, 4, 5], description: '0=Sun .. 6=Sat' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  workingDays?: number[];

  @ApiPropertyOptional({ type: [Number], example: [0, 6] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekendDays?: number[];
}
