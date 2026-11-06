import { describe, it, expect } from 'vitest';
import { MAX_LETTERS, normalizeLetters, sortedKey } from '../src/lib/letters';

describe('normalizeLetters', () => {
  it('lowercases and drops spaces', () => {
    expect(normalizeLetters('T C A O R P E')).toBe('tcaorpe');
  });
  it('drops digits, punctuation and non a-z letters', () => {
    expect(normalizeLetters('abc-123 déf')).toBe('abcdf');
  });
  it('returns empty when no letters remain', () => {
    expect(normalizeLetters('!!! 123')).toBe('');
  });
  it('caps at 48 letters', () => {
    expect(MAX_LETTERS).toBe(48);
    expect(normalizeLetters('a'.repeat(60))).toHaveLength(48);
  });
});

describe('sortedKey', () => {
  it('sorts letters alphabetically', () => {
    expect(sortedKey('carpet')).toBe('aceprt');
  });
  it('handles empty input', () => {
    expect(sortedKey('')).toBe('');
  });
});
