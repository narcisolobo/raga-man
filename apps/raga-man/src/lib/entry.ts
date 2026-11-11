import { MAX_LETTERS, normalizeLetters } from './letters';

export interface Entry {
  /** Normalized letters (lowercase a-z, capped at MAX_LETTERS). */
  letters: string;
  /** Every character that is not a letter (spaces included), all of which are ignored. */
  ignored: number;
  /** True when something other than spaces was ignored; spaces alone are expected, so stay quiet. */
  noisy: boolean;
  /** Letters beyond MAX_LETTERS that were left out. */
  dropped: number;
  /** Index of the square the caret sits in (equals letters.length at the end). */
  active: number;
}

/**
 * Reads what the visitor has typed without changing it: the raw value stays in
 * the input, because rewriting it mid-composition breaks mobile keyboards.
 */
export function readEntry(raw: string, caret: number = raw.length): Entry {
  const letters = normalizeLetters(raw);
  const rawLetters = raw.replace(/[^a-z]/gi, '').length;
  const ignored = raw.replace(/[a-z]/gi, '').length;
  const noisy = /[^a-z\s]/i.test(raw);
  const active = normalizeLetters(raw.slice(0, Math.max(0, caret))).length;
  return { letters, ignored, noisy, dropped: Math.max(0, rawLetters - MAX_LETTERS), active };
}

/** Plain-language note about what was ignored or left out; empty when nothing was. */
export function entryNote({ ignored, noisy, dropped }: Pick<Entry, 'ignored' | 'noisy' | 'dropped'>): string {
  const notes: string[] = [];
  if (noisy) {
    notes.push(
      ignored === 1
        ? 'Ignored 1 character that is not a letter.'
        : `Ignored ${ignored} characters that are not letters.`,
    );
  }
  if (dropped > 0) {
    notes.push(`Only the first ${MAX_LETTERS} letters are used; ${dropped} left out.`);
  }
  return notes.join(' ');
}
