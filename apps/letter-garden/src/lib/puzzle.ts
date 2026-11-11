export type Puzzle = { letters: string; required: string };

type PuzzleError = { ok: false; field: 'letters' | 'required'; message: string };
type PuzzleResult = { ok: true; puzzle: Puzzle; note: string } | PuzzleError;

export function readLetters(raw: string) {
  const letters = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const notes: string[] = [];
  if (/[^a-zA-Z\s]/.test(raw)) notes.push('Ignoring anything that is not a letter.');
  if (new Set(letters).size < letters.length) notes.push('Each letter can be used once.');
  const note = notes.join(' ');
  let message = '';
  if (letters.length !== 7) message = 'Enter exactly seven letters.';
  else if (new Set(letters).size !== 7) message = 'Use seven different letters.';
  return { letters, note, message };
}

export function validatePuzzle(rawLetters: string, rawRequired: string): PuzzleResult {
  const { letters, note, message } = readLetters(rawLetters);
  if (message) return { ok: false, field: 'letters', message };
  const required = rawRequired.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (required.length !== 1 || !letters.includes(required)) {
    return { ok: false, field: 'required', message: 'Put the required letter in the first square.' };
  }
  return { ok: true, puzzle: { letters: [...letters].sort().join(''), required }, note };
}

export function puzzleUrl(puzzle: Puzzle): string {
  return '/results?' + new URLSearchParams({ letters: puzzle.letters, required: puzzle.required });
}

export function readPuzzle(params: URLSearchParams): PuzzleResult {
  for (const field of ['letters', 'required'] as const) {
    if (params.getAll(field).length > 1) {
      return { ok: false, field, message: field === 'letters' ? 'Enter one set of seven letters.' : 'Choose one required letter.' };
    }
  }
  return validatePuzzle(params.get('letters') ?? '', params.get('required') ?? '');
}

/** The order the form shows a puzzle in: required letter first, the rest alphabetical. */
export function entryOrder({ letters, required }: Puzzle): string {
  return required + [...letters].sort().filter((letter) => letter !== required).join('');
}

/**
 * What to put in the field for a given letters/required pair. Only a valid set
 * is reordered; anything else stays exactly as the visitor or link gave it.
 */
export function fieldValue(rawLetters: string, rawRequired: string): string {
  const { letters, message } = readLetters(rawLetters);
  const required = rawRequired.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (message || required.length !== 1 || !letters.includes(required)) return rawLetters;
  return entryOrder({ letters, required });
}
