import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreatePropertyImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/p/1.jpg' })
  @IsUrl()
  @MaxLength(1000)
  url!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) caption?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class UpdatePropertyImageDto extends PartialType(CreatePropertyImageDto) {}
