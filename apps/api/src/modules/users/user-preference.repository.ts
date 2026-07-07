import { Injectable } from '@nestjs/common';
import { type Prisma, type UserPreference } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { type UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

@Injectable()
export class UserPreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string): Promise<UserPreference | null> {
    return this.prisma.userPreference.findUnique({ where: { userId } });
  }

  upsert(userId: string, dto: UpdateUserPreferenceDto): Promise<UserPreference> {
    const { notificationPreferences, ...rest } = dto;
    // JSON columns need InputJsonValue rather than an untyped object.
    const data = {
      ...rest,
      ...(notificationPreferences !== undefined
        ? { notificationPreferences: notificationPreferences as Prisma.InputJsonValue }
        : {}),
    };
    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
    });
  }
}
