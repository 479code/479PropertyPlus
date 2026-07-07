import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';

import { CurrentUser } from '../../common/auth/current-user.decorator';

import { type AuthSession, AuthService } from './auth.service';
import { type AuthenticatedUser } from './auth.types';
import { SwitchOrganizationDto } from './dto/switch-organization.dto';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationSwitchController {
  constructor(private readonly auth: AuthService) {}

  @Post('switch')
  @HttpCode(200)
  @ApiOperation({ summary: 'Switch the active organization and mint a fresh token pair' })
  switch(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SwitchOrganizationDto,
    @Req() req: Request,
  ): Promise<AuthSession> {
    return this.auth.switchOrganization(user, dto.organizationId, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }
}
