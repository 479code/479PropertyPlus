import { type Paginated } from '@479property/types';
import { paginate } from '@479property/utils';
import { Injectable, Logger } from '@nestjs/common';
import { type AuditAction } from '@prisma/client';

import { AuditRepository } from './audit.repository';
import { type QueryAuditDto } from './dto/query-audit.dto';

export interface RecordAuditInput {
  organizationId?: string | null;
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  description?: string;
  changes?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly repository: AuditRepository) {}

  /**
   * Persist an audit record. Failures are logged but never thrown, so auditing
   * can never break the primary operation it is recording.
   */
  async record(input: RecordAuditInput): Promise<void> {
    try {
      await this.repository.create({
        organizationId: input.organizationId ?? null,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        description: input.description ?? null,
        changes: (input.changes as unknown) ?? undefined,
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log for ${input.entityType}`, error as Error);
    }
  }

  async query(organizationId: string, dto: QueryAuditDto): Promise<Paginated<unknown>> {
    const where: Record<string, unknown> = { organizationId };
    if (dto.entityType) where.entityType = dto.entityType;
    if (dto.action) where.action = dto.action;
    if (dto.entityId) where.entityId = dto.entityId;

    const skip = (dto.page - 1) * dto.pageSize;
    const [items, total] = await this.repository.findManyAndCount(where, skip, dto.pageSize);
    return paginate(items, total, { page: dto.page, pageSize: dto.pageSize });
  }
}
