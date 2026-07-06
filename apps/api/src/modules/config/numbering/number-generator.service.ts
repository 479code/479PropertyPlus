import { Injectable } from '@nestjs/common';
import { type NumberedEntity, type NumberingSequence } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

import { formatSequenceNumber, resolvePeriod } from './number-format.util';

/** Sensible default prefixes used when a sequence is auto-provisioned on first use. */
const DEFAULT_PREFIX: Record<NumberedEntity, string> = {
  PROPERTY: 'PROP',
  TENANT: 'TEN',
  LEASE: 'LSE',
  INVOICE: 'INV',
  RECEIPT: 'RCP',
  PAYMENT: 'PAY',
  MAINTENANCE_TICKET: 'MTK',
  INSPECTION: 'INS',
};

export interface GeneratedNumber {
  /** The raw reserved counter value. */
  value: number;
  /** The formatted identifier, e.g. `PROP-000001`. */
  formatted: string;
}

@Injectable()
export class NumberGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomically reserve and format the next identifier for an entity.
   *
   * The read-modify-write of `currentValue` runs inside a transaction so two
   * concurrent callers cannot observe the same base value. When the configured
   * reset policy rolls over to a new period (year/month), the counter restarts
   * at 1 and the new period is recorded.
   *
   * If no sequence exists yet for the entity it is provisioned on demand with a
   * default prefix, so number issuance never fails for an unconfigured entity.
   *
   * TODO(concurrency): under heavy concurrent issuance, add an explicit
   * row-level lock (SELECT ... FOR UPDATE via $queryRaw) or a Postgres advisory
   * lock to fully serialize reservation; the transaction alone narrows but does
   * not eliminate the race under READ COMMITTED.
   */
  async next(
    organizationId: string,
    entity: NumberedEntity,
    actorId?: string,
  ): Promise<GeneratedNumber> {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.numberingSequence.findUnique({
        where: { organizationId_entity: { organizationId, entity } },
      });

      const sequence: NumberingSequence =
        existing ??
        (await tx.numberingSequence.create({
          data: {
            organizationId,
            entity,
            prefix: DEFAULT_PREFIX[entity],
            createdBy: actorId,
            updatedBy: actorId,
          },
        }));

      const period = resolvePeriod(sequence.resetPolicy, now);
      const rolledOver = period !== null && period !== sequence.lastResetPeriod;
      const nextValue = (rolledOver ? 0 : sequence.currentValue) + 1;

      await tx.numberingSequence.update({
        where: { id: sequence.id },
        data: { currentValue: nextValue, lastResetPeriod: period, updatedBy: actorId },
      });

      return { value: nextValue, formatted: formatSequenceNumber(sequence, nextValue, now) };
    });
  }
}
