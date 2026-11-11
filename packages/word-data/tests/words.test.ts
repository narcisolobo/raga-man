import { expect, it } from 'vitest';
import { prepareWords } from '@solver-suite/word-data/words';

it('trims, filters with the supplied policy, deduplicates, and sorts', () => {
  const lines = [' Pear ', 'pear ', 'pear', ' apple', ''];
  expect(prepareWords(lines, (word) => /^[a-z]+$/.test(word))).toEqual(['apple', 'pear']);
  expect(prepareWords(lines, (word) => /^[A-Z]/.test(word))).toEqual(['Pear']);
});
