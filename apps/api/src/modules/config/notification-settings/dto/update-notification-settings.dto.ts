import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() whatsappEnabled?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() inAppEnabled?: boolean;
}
