import { sortedKey } from './letters';

export type ExactIndex = Record<string, string[]>;

/** Map sorted-letters key to the words sharing it (alphabetical). */
export function buildExactIndex(words: string[]): ExactIndex {
  const index: ExactIndex = {};
  for (const word of [...words].sort()) {
    (index[sortedKey(word)] ??= []).push(word);
  }
  return index;
}

export function findExact(index: Map<string, string[]>, letters: string): string[] {
  return index.get(sortedKey(letters)) ?? [];
}
