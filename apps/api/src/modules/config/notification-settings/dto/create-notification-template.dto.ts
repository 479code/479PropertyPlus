import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel, NotificationEvent } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNotificationTemplateDto {
  @ApiProperty({ enum: NotificationEvent })
  @IsEnum(NotificationEvent)
  event!: NotificationEvent;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiPropertyOptional({ example: 'Your rent is due' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({ example: 'Hi {{tenantName}}, your rent of {{amount}} is due on {{dueDate}}.' })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
