import { Injectable, NotFoundException } from '@nestjs/common';
import { type User } from '@prisma/client';

import { UsersRepository } from './users.repository';

/** A user projection safe to return over the API (never exposes passwordHash). */
export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toPublicUser(user);
  }
}
