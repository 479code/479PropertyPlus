import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConfigurationCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class QueryConfigurationOptionDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ConfigurationCategory })
  @IsOptional()
  @IsEnum(ConfigurationCategory)
  category?: ConfigurationCategory;

  @ApiPropertyOptional({ description: 'Filter by active state' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
