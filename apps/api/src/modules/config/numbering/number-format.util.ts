import { type NumberingSequence, type SequenceResetPolicy } from '@prisma/client';

/**
 * Resolve the reset-period bucket a sequence belongs to at a given moment.
 * NEVER  -> null (a single, ever-incrementing series)
 * YEARLY -> "YYYY"
 * MONTHLY-> "YYYY-MM"
 * All computed in UTC so the bucket is deterministic regardless of server locale.
 */
export function resolvePeriod(policy: SequenceResetPolicy, date: Date): string | null {
  switch (policy) {
    case 'YEARLY':
      return String(date.getUTCFullYear());
    case 'MONTHLY':
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    default:
      return null;
  }
}

type FormattableSequence = Pick<
  NumberingSequence,
  'prefix' | 'suffix' | 'padding' | 'separator' | 'includeYear'
>;

/**
 * Build the human-facing identifier for a reserved value.
 * Components (prefix, optional year, zero-padded number, optional suffix) are
 * joined by the configured separator, e.g. `PROP-000001` or `PAY-2026-000001`.
 * Padding never truncates: values wider than `padding` are emitted in full.
 */
export function formatSequenceNumber(
  sequence: FormattableSequence,
  value: number,
  date: Date,
): string {
  const parts: string[] = [];
  if (sequence.prefix) parts.push(sequence.prefix);
  if (sequence.includeYear) parts.push(String(date.getUTCFullYear()));
  parts.push(String(value).padStart(sequence.padding, '0'));
  if (sequence.suffix) parts.push(sequence.suffix);
  return parts.join(sequence.separator);
}
