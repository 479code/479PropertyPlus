import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdatePaymentSettingsDto {
  @ApiPropertyOptional({ example: 'INV' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  invoicePrefix?: string;

  @ApiPropertyOptional({ example: 'RCP' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  receiptPrefix?: string;

  @ApiPropertyOptional({ example: '₦' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  currencySymbol?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  taxEnabled?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, example: 7.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  vatEnabled?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, example: 7.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  vatRate?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  taxInclusive?: boolean;
}
