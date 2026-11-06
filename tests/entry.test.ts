import { describe, it, expect } from 'vitest';
import { readEntry, entryNote } from '../src/lib/entry';
import { MAX_LETTERS } from '../src/lib/letters';

describe('readEntry', () => {
  it('normalizes and leaves the caret at the end by default', () => {
    expect(readEntry('CAR')).toEqual({ letters: 'car', ignored: 0, noisy: false, dropped: 0, active: 3 });
  });

  it('counts every non-letter as ignored, but only flags noise beyond spaces', () => {
    expect(readEntry('l e-t3')).toMatchObject({ ignored: 3, noisy: true });
    expect(readEntry('l e t')).toMatchObject({ ignored: 2, noisy: false });
  });

  it('counts repeated letters', () => {
    expect(readEntry('lettter').letters).toBe('lettter');
  });

  it('maps the caret to a square, skipping ignored characters', () => {
    expect(readEntry('a-b c', 3).active).toBe(2);
    expect(readEntry('abc', 0).active).toBe(0);
    expect(readEntry('abc', -5).active).toBe(0);
  });

  it('reports letters beyond the cap as dropped', () => {
    const entry = readEntry('a'.repeat(MAX_LETTERS + 3));
    expect(entry.letters).toHaveLength(MAX_LETTERS);
    expect(entry.dropped).toBe(3);
    expect(entry.active).toBe(MAX_LETTERS);
  });

  it('handles empty input', () => {
    expect(readEntry('')).toEqual({ letters: '', ignored: 0, noisy: false, dropped: 0, active: 0 });
  });
});

describe('entryNote', () => {
  it('is empty when nothing was ignored or dropped', () => {
    expect(entryNote({ ignored: 0, noisy: false, dropped: 0 })).toBe('');
    expect(entryNote({ ignored: 4, noisy: false, dropped: 0 })).toBe('');
  });

  it('names the problem in plain language', () => {
    expect(entryNote({ ignored: 1, noisy: true, dropped: 0 })).toBe('Ignored 1 character that is not a letter.');
    expect(entryNote({ ignored: 2, noisy: true, dropped: 0 })).toBe('Ignored 2 characters that are not letters.');
    expect(entryNote({ ignored: 0, noisy: false, dropped: 4 })).toBe('Only the first 48 letters are used; 4 left out.');
  });

  it('joins both notes', () => {
    expect(entryNote({ ignored: 1, noisy: true, dropped: 2 })).toContain('Ignored 1');
    expect(entryNote({ ignored: 1, noisy: true, dropped: 2 })).toContain('left out');
  });
});
