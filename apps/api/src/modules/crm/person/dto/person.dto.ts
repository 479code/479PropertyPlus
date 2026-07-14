import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({ example: 'Ada' }) @IsString() @MaxLength(80) firstName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) middleName?: string;
  @ApiProperty({ example: 'Lovelace' }) @IsString() @MaxLength(80) lastName!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) maritalStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) nationality?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) occupation?: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) alternatePhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) profilePhoto?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) postalCode?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) identificationType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) identificationNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() identificationExpiry?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) taxIdentificationNumber?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;

  @ApiPropertyOptional({ description: 'Override the auto-generated person code' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  personCode?: string;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'PersonType ids for the roles this person holds',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({
    format: 'uuid',
    description: "Which of roleIds is this person's primary role",
  })
  @IsOptional()
  @IsUUID()
  primaryRoleId?: string;
}

export class UpdatePersonDto extends PartialType(CreatePersonDto) {}

const SORTABLE = ['createdAt', 'fullName', 'personCode'] as const;
type Sortable = (typeof SORTABLE)[number];

function toArray(v: unknown): string[] | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  return Array.isArray(v) ? (v as string[]) : String(v).split(',').filter(Boolean);
}
function toBool(v: unknown): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  return v === 'true' || v === true;
}

export class SearchPersonDto {
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() identificationNumber?: string;
  @ApiPropertyOptional({ description: 'Global search across code/name/email/phone' })
  @IsOptional()
  @IsString()
  q?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() companyId?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by held role (PersonType id)' })
  @IsOptional()
  @IsUUID()
  personTypeId?: string;
  @ApiPropertyOptional({ description: 'Comma-separated tag ids' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  tagIds?: string[];
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  isActive?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  includeArchived?: boolean;

  @ApiPropertyOptional({ enum: SORTABLE, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORTABLE as unknown as string[])
  sortBy: Sortable = 'createdAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
