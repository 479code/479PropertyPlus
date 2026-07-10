import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Floor } from '@prisma/client';

import { CurrentUser } from '../../../common/auth/current-user.decorator';
import { RequirePermissions } from '../../../common/auth/require-permissions.decorator';
import { OrgId } from '../../../common/tenant/tenant.decorators';

import { CreateFloorDto, UpdateFloorDto } from './dto/floor.dto';
import { FloorService } from './floor.service';

@ApiTags('Floors')
@ApiBearerAuth()
@Controller()
export class FloorController {
  constructor(private readonly service: FloorService) {}

  @Get('buildings/:buildingId/floors')
  @RequirePermissions('building:read')
  @ApiOperation({ summary: 'List floors in a building' })
  list(@OrgId() o: string, @Param('buildingId') buildingId: string): Promise<Floor[]> {
    return this.service.listByBuilding(o, buildingId);
  }

  @Post('floors')
  @RequirePermissions('floor:create')
  @ApiOperation({ summary: 'Create a floor' })
  create(
    @OrgId() o: string,
    @Body() dto: CreateFloorDto,
    @CurrentUser('userId') a: string,
  ): Promise<Floor> {
    return this.service.create(o, dto, a);
  }

  @Patch('floors/:id')
  @RequirePermissions('floor:update')
  @ApiOperation({ summary: 'Update a floor' })
  update(
    @OrgId() o: string,
    @Param('id') id: string,
    @Body() dto: UpdateFloorDto,
    @CurrentUser('userId') a: string,
  ): Promise<Floor> {
    return this.service.update(o, id, dto, a);
  }

  @Delete('floors/:id')
  @HttpCode(204)
  @RequirePermissions('floor:delete')
  @ApiOperation({ summary: 'Delete a floor' })
  async remove(
    @OrgId() o: string,
    @Param('id') id: string,
    @CurrentUser('userId') a: string,
  ): Promise<void> {
    await this.service.remove(o, id, a);
  }
}
