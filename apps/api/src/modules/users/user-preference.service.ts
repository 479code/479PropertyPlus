import { Injectable } from '@nestjs/common';
import { type UserPreference } from '@prisma/client';

import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreferenceRepository } from './user-preference.repository';

@Injectable()
export class UserPreferenceService {
  constructor(private readonly repository: UserPreferenceRepository) {}

  /** Return the user's preferences, materializing defaults on first access. */
  async get(userId: string): Promise<UserPreference> {
    const existing = await this.repository.findByUser(userId);
    return existing ?? this.repository.upsert(userId, {});
  }

  update(userId: string, dto: UpdateUserPreferenceDto): Promise<UserPreference> {
    return this.repository.upsert(userId, dto);
  }
}
