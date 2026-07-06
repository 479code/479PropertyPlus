import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpsertFeatureFlagDto {
  @ApiProperty({
    description: 'Whether the feature is enabled for the organization',
    default: false,
  })
  @IsBoolean()
  isEnabled!: boolean;
}
