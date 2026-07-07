import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SwitchOrganizationDto {
  @ApiProperty({ format: 'uuid', description: 'The organization to switch the active session to' })
  @IsUUID()
  organizationId!: string;
}
