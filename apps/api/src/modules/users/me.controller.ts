import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type Membership, type UserPreference } from '@prisma/client';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { MembershipService } from '../membership/membership.service';

import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreferenceService } from './user-preference.service';
import { type PublicUser, UsersService } from './users.service';

@ApiTags('Me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(
    private readonly users: UsersService,
    private readonly preferences: UserPreferenceService,
    private readonly memberships: MembershipService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  me(@CurrentUser('userId') userId: string): Promise<PublicUser> {
    return this.users.getProfile(userId);
  }

  @Get('memberships')
  @ApiOperation({ summary: 'List the organizations the authenticated user belongs to' })
  memberships_(@CurrentUser('userId') userId: string): Promise<Membership[]> {
    return this.memberships.listForUser(userId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get the authenticated user preferences' })
  getPreferences(@CurrentUser('userId') userId: string): Promise<UserPreference> {
    return this.preferences.get(userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update the authenticated user preferences' })
  updatePreferences(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateUserPreferenceDto,
  ): Promise<UserPreference> {
    return this.preferences.update(userId, dto);
  }
}
