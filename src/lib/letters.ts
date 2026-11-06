export const MAX_LETTERS = 48;

/** Lowercase, keep only a-z, cap at MAX_LETTERS. */
export function normalizeLetters(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z]/g, '').slice(0, MAX_LETTERS);
}

/** Letters sorted alphabetically: the anagram key. */
export function sortedKey(letters: string): string {
  return [...letters].sort().join('');
}
