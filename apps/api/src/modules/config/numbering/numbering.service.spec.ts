import { formatSequenceNumber, resolvePeriod } from './number-format.util';

describe('number-format', () => {
  const base = { prefix: 'PROP', suffix: '', padding: 6, separator: '-', includeYear: false };
  const when = new Date('2026-07-06T00:00:00Z');

  describe('formatSequenceNumber', () => {
    it('formats a zero-padded number behind the prefix', () => {
      expect(formatSequenceNumber(base, 1, when)).toBe('PROP-000001');
    });

    it('injects the year when includeYear is set', () => {
      expect(formatSequenceNumber({ ...base, prefix: 'PAY', includeYear: true }, 1, when)).toBe(
        'PAY-2026-000001',
      );
    });

    it('never truncates values wider than the padding', () => {
      expect(formatSequenceNumber(base, 1234567, when)).toBe('PROP-1234567');
    });

    it('appends a suffix when configured', () => {
      expect(formatSequenceNumber({ ...base, suffix: 'X' }, 42, when)).toBe('PROP-000042-X');
    });

    it('omits an empty prefix', () => {
      expect(formatSequenceNumber({ ...base, prefix: '' }, 7, when)).toBe('000007');
    });
  });

  describe('resolvePeriod', () => {
    it('returns null for a non-resetting sequence', () => {
      expect(resolvePeriod('NEVER', when)).toBeNull();
    });

    it('buckets yearly sequences by UTC year', () => {
      expect(resolvePeriod('YEARLY', when)).toBe('2026');
    });

    it('buckets monthly sequences by UTC year-month', () => {
      expect(resolvePeriod('MONTHLY', when)).toBe('2026-07');
    });
  });
});
