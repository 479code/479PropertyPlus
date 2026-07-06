import { Injectable } from '@nestjs/common';
import { type AuditLog, type AuditAction, type Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogCreateData {
  organizationId?: string | null;
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  description?: string | null;
  changes?: unknown;
}

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: AuditLogCreateData): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        organizationId: data.organizationId ?? null,
        userId: data.userId ?? null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId ?? null,
        description: data.description ?? null,
        changes: (data.changes ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  findManyAndCount(
    where: Record<string, unknown>,
    skip: number,
    take: number,
  ): Promise<[AuditLog[], number]> {
    return Promise.all([
      this.prisma.auditLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);
  }
}
