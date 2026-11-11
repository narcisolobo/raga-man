import { buildTrie } from '@solver-suite/word-data/trie';
import { expect, it } from 'vitest';
import { findWords } from '../src/lib/search';

const words = ['cat', 'carton', 'cartoon', 'coronation', 'action', 'inaction', 'ration', 'nectar'];
const root = buildTrie(words);

it('allows repeated letters and groups words by distinct coverage and length', () => {
  const puzzle = { letters: 'acinort', required: 'c' };
  const result = {
    allSeven: ['coronation'],
    groups: [
      { length: 8, words: ['inaction'] },
      { length: 7, words: ['cartoon'] },
      { length: 6, words: ['action', 'carton'] },
    ],
    total: 5,
  };
  expect(findWords(root, puzzle)).toEqual(result);
  expect(findWords(root, { ...puzzle, required: 'r' }).groups.flatMap((group) => group.words)).toContain('ration');
  expect(findWords(root, puzzle)).toEqual(result);
});

it.each([
  { letters: 'acinort', required: 'i' },
  { letters: 'acenort', required: 'e' },
  { letters: 'bdfghjk', required: 'j' },
])('agrees with a dictionary scan for $letters with $required', (puzzle) => {
  const expected = words.filter((word) => word.length >= 4 && word.includes(puzzle.required)
    && [...word].every((letter) => puzzle.letters.includes(letter)));
  const { allSeven, groups, total } = findWords(root, puzzle);
  expect([...allSeven, ...groups.flatMap((group) => group.words)].sort()).toEqual(expected.sort());
  expect(total).toBe(expected.length);
});
