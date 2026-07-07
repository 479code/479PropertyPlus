import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: 'newmember@acme.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'manager',
    description: 'Key of the role to grant on acceptance (e.g. admin, manager, viewer)',
  })
  @IsString()
  @MaxLength(60)
  roleKey!: string;
}
