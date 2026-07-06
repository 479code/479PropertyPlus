import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateLeaseSettingsDto {
  @ApiPropertyOptional({ minimum: 0, maximum: 365, default: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  renewalNoticePeriodDays?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 365, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  gracePeriodDays?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}
