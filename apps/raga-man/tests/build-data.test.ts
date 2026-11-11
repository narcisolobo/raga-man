import { describe, it, expect } from 'vitest';
import { buildData } from '../scripts/build-data';
import { decodeTrie } from '@solver-suite/word-data/trie';
import { searchPartials } from '../src/lib/trie';

describe('buildData', () => {
  const lines = ['care', 'race', 'acre', 'Paris', "dog's", 'cart', 'carts'];
  const { exact, trie } = buildData(lines);

  it('indexes anagrams under the sorted key and drops junk', () => {
    const index = JSON.parse(exact) as Record<string, string[]>;
    expect(index['acer']).toEqual(['acre', 'care', 'race']);
    expect(Object.values(index).flat()).not.toContain('Paris');
  });

  it('encodes a trie that finds partials', () => {
    const groups = searchPartials(decodeTrie(trie), 'carts');
    expect(groups.flatMap((g) => g.words)).toContain('cart');
  });

  it('contains no apostrophes or uppercase letters', () => {
    expect(/['A-Z]/.test(exact.replace(/[{}\[\]":,]/g, '') + trie)).toBe(false);
  });
});
