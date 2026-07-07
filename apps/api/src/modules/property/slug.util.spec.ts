import { slugify } from './slug.util';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Prime Estate Phase 1')).toBe('prime-estate-phase-1');
  });
  it('strips punctuation and collapses separators', () => {
    expect(slugify('  Ocean View!! @ Lekki  ')).toBe('ocean-view-lekki');
  });
  it('removes diacritics', () => {
    expect(slugify('Résidence Élégante')).toBe('residence-elegante');
  });
  it('handles empty-ish input', () => {
    expect(slugify('---')).toBe('');
  });
});
