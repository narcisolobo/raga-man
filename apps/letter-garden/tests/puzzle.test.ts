import { describe, expect, it } from 'vitest';
import { entryOrder, fieldValue, puzzleUrl, readLetters, readPuzzle, validatePuzzle } from '../src/lib/puzzle';

describe('puzzle input', () => {
  it('normalizes letters, preserves feedback, and produces a shareable URL', () => {
    const result = validatePuzzle('TRO NICA!', 'C');
    expect(result).toMatchObject({ ok: true, puzzle: { letters: 'acinort', required: 'c' }, note: expect.any(String) });
    if (!result.ok) throw new Error(result.message);
    const url = puzzleUrl(result.puzzle);
    expect(url).toBe('/results?letters=acinort&required=c');
    expect(readPuzzle(new URL(url, 'https://example.test').searchParams)).toMatchObject({ ok: true, puzzle: result.puzzle });
    expect(validatePuzzle('A C I N O R T', 'C')).toMatchObject({ ok: true, note: '' });
  });

  it.each(['aacnort', 'acnort', 'acinortx', 'acinortt', '', '123', 'ácinort'])('rejects invalid letter sets (%s)', (letters) => {
    expect(validatePuzzle(letters, 'c')).toMatchObject({ ok: false, field: 'letters' });
  });

  it.each(['', 'cc', 'x', 'é'])('rejects invalid required letters (%s)', (required) => {
    expect(validatePuzzle('acinort', required)).toMatchObject({ ok: false, field: 'required' });
  });

  it.each(['letters=acinort&letters=acinort&required=c', 'letters=acinort&required=c&required=c'])('rejects duplicate URL parameters (%s)', (query) => {
    expect(readPuzzle(new URLSearchParams(query))).toMatchObject({ ok: false });
  });
});

describe('field order', () => {
  it('puts the required letter first and the rest alphabetical', () => {
    expect(entryOrder({ letters: 'acinort', required: 'r' })).toBe('racinot');
    expect(entryOrder({ letters: 'acinort', required: 'a' })).toBe('acinort');
  });

  it('reorders only a valid set whose required letter is in it', () => {
    expect(fieldValue('acinort', 'c')).toBe('cainort');
    expect(fieldValue('TRO NICA', 'c')).toBe('cainort');
    expect(fieldValue('acinort', 'x')).toBe('acinort');
    expect(fieldValue('acinort', '')).toBe('acinort');
    expect(fieldValue('aacnort', 'c')).toBe('aacnort');
  });

  it('takes the first typed letter as the required letter', () => {
    const { letters } = readLetters('c-a i n o r t');
    expect(validatePuzzle('c-a i n o r t', letters[0])).toMatchObject({ ok: true, puzzle: { letters: 'acinort', required: 'c' } });
  });

  it('explains what it ignored and repeated letters', () => {
    expect(readLetters('ac-inort').note).toBe('Ignoring anything that is not a letter.');
    expect(readLetters('aacnort').note).toBe('Each letter can be used once.');
    expect(readLetters('acinort').note).toBe('');
  });
});
