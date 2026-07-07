import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Request } from 'express';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { Public } from '../../common/auth/public.decorator';

import { type AuthSession, AuthService, type RequestMeta } from './auth.service';
import { type AuthenticatedUser } from './auth.types';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

function metaFrom(req: Request): RequestMeta {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Self-service signup: create a user, organization, and Owner membership',
  })
  register(@Body() dto: RegisterDto, @Req() req: Request): Promise<AuthSession> {
    return this.auth.register(dto, metaFrom(req));
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Password login' })
  login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthSession> {
    return this.auth.login(dto, metaFrom(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate a refresh token for a new access + refresh pair' })
  refresh(@Body() dto: RefreshDto, @Req() req: Request): Promise<AuthSession> {
    return this.auth.refresh(dto.refreshToken, metaFrom(req));
  }

  @Public()
  @Post('accept-invite')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Accept an organization invitation (joins, creating an account if needed)',
  })
  acceptInvite(@Body() dto: AcceptInviteDto, @Req() req: Request): Promise<AuthSession> {
    return this.auth.acceptInvite(dto, metaFrom(req));
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke the presented refresh token' })
  async logout(@CurrentUser() user: AuthenticatedUser, @Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(user, dto.refreshToken);
  }

  @ApiBearerAuth()
  @Get('session')
  @ApiOperation({ summary: 'Return the active-session principal (user, org, membership)' })
  session(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
