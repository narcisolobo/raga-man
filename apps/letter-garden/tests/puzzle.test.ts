import { describe, expect, it } from 'vitest';
import { puzzleUrl, readPuzzle, validatePuzzle } from '../src/lib/puzzle';

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
