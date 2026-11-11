import type { TrieNode } from '@solver-suite/word-data/trie';
import type { Puzzle } from './puzzle';

export const MIN_WORD_LENGTH = 4;
export type WordGroup = { length: number; words: string[] };
export type SearchResults = { allSeven: string[]; groups: WordGroup[]; total: number };

export function findWords(root: TrieNode, puzzle: Puzzle): SearchResults {
  const bits = new Map([...puzzle.letters].map((letter, index) => [letter, 1 << index]));
  const fullMask = (1 << bits.size) - 1;
  const requiredBit = bits.get(puzzle.required)!;
  const allSeven: string[] = [];
  const byLength = new Map<number, string[]>();
  let total = 0;

  function walk(node: TrieNode, word: string, coverage: number): void {
    if (node.end && word.length >= MIN_WORD_LENGTH && (coverage & requiredBit)) {
      total++;
      if (coverage === fullMask) {
        allSeven.push(word);
      } else {
        const group = byLength.get(word.length) ?? [];
        group.push(word);
        byLength.set(word.length, group);
      }
    }

    for (const [letter, child] of node.children) {
      const bit = bits.get(letter);
      if (bit !== undefined) walk(child, word + letter, coverage | bit);
    }
  }

  walk(root, '', 0);
  const groups = [...byLength]
    .sort(([first], [second]) => second - first)
    .map(([length, words]) => ({ length, words: words.sort() }));
  return { allSeven: allSeven.sort(), groups, total };
}
