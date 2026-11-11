import { readFileSync } from 'node:fs';
import { decodeTrie } from '@solver-suite/word-data/trie';
import { expect, it } from 'vitest';
import { buildData } from '../scripts/build-data';
import { findWords } from '../src/lib/search';

const puzzle = { letters: 'acinort', required: 'c' };

it('keeps only playable entries, with repeats and long words allowed', () => {
  const { trie, wordCount } = buildData([
    ' coronation ', 'coronation', 'cartoon', 'Paris', "dog's", 'café', 'two-fold', 'cat', 'abcdefgh',
  ]);
  expect(wordCount).toBe(2);
  expect(findWords(decodeTrie(trie), puzzle)).toEqual({
    allSeven: ['coronation'],
    groups: [{ length: 7, words: ['cartoon'] }],
    total: 2,
  });
});

it('finds the example words in the vendored dictionary', () => {
  const dictionary = readFileSync(new URL('../../../data/wamerican/words.txt', import.meta.url), 'utf8');
  const { trie } = buildData(dictionary.split('\n'));
  expect(trie).toMatch(/^[a-z$()]+$/);
  const { allSeven, groups } = findWords(decodeTrie(trie), puzzle);
  expect(allSeven).toContain('coronation');
  expect(groups.find((group) => group.length === 7)?.words).toContain('cartoon');
  expect(groups.flatMap((group) => group.words)).not.toContain('ration');
});
