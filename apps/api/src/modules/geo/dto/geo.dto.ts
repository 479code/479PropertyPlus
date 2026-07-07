import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'NG', description: 'ISO 3166-1 alpha-2 code' })
  @IsString()
  @Length(2, 3)
  isoCode!: string;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
export class UpdateCountryDto extends PartialType(CreateCountryDto) {}

export class CreateStateDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  countryId!: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'LA' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;
}
export class UpdateStateDto extends PartialType(CreateStateDto) {}

export class CreateCityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  stateId!: string;

  @ApiProperty({ example: 'Ikeja' })
  @IsString()
  @MaxLength(120)
  name!: string;
}
export class UpdateCityDto extends PartialType(CreateCityDto) {}

export class CreateDistrictDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  cityId!: string;

  @ApiProperty({ example: 'GRA' })
  @IsString()
  @MaxLength(120)
  name!: string;
}
export class UpdateDistrictDto extends PartialType(CreateDistrictDto) {}

export class CreateAreaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  districtId!: string;

  @ApiProperty({ example: 'Phase 1' })
  @IsString()
  @MaxLength(120)
  name!: string;
}
export class UpdateAreaDto extends PartialType(CreateAreaDto) {}
