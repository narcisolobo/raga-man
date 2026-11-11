import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { filterWords, isPlayableWord } from '../src/lib/filter';

describe('filterWords', () => {
  it('drops proper nouns, possessives, hyphens, accents, short words and duplicates', () => {
    expect(filterWords(['care', 'Paris', "dog's", 're-do', 'résumé', 'cat', 'care'])).toEqual(['care']);
  });
  it('returns sorted words', () => {
    expect(filterWords(['race', 'acre'])).toEqual(['acre', 'race']);
  });
  it('cleans the real wamerican list', () => {
    const words = filterWords(readFileSync(new URL('../../../data/wamerican/words.txt', import.meta.url), 'utf8').split('\n'));
    expect(words).toContain('carpet');
    expect(words.some((w) => /['A-Z]/.test(w))).toBe(false);
    expect(words.every((w) => w.length >= 4)).toBe(true);
  });
});

describe('isPlayableWord', () => {
  it('rejects three-letter words', () => expect(isPlayableWord('cat')).toBe(false));
  it('accepts four-letter lowercase words', () => expect(isPlayableWord('cart')).toBe(true));
  it('rejects capitalized words', () => expect(isPlayableWord('Cart')).toBe(false));
});
