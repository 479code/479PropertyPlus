import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateLeaseNoteDto {
  @ApiProperty() @IsString() @MaxLength(4000) note!: string;
}
