import type { TrieNode } from '@solver-suite/word-data/trie';

export interface PartialGroup {
  length: number;
  words: string[];
}

/** Words buildable from a subset of `letters`, length >= minLength and < letters.length. */
export function searchPartials(root: TrieNode, letters: string, minLength = 4): PartialGroup[] {
  const counts = new Array<number>(26).fill(0);
  for (const ch of letters) counts[ch.charCodeAt(0) - 97]!++;
  const byLength = new Map<number, string[]>();

  const walk = (node: TrieNode, prefix: string): void => {
    if (node.end && prefix.length >= minLength && prefix.length < letters.length) {
      const list = byLength.get(prefix.length) ?? [];
      list.push(prefix);
      byLength.set(prefix.length, list);
    }
    for (const [ch, child] of node.children) {
      const slot = ch.charCodeAt(0) - 97;
      if (counts[slot]! > 0) {
        counts[slot]!--;
        walk(child, prefix + ch);
        counts[slot]!++;
      }
    }
  };
  walk(root, '');

  return [...byLength.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([length, words]) => ({ length, words: words.sort() }));
}
