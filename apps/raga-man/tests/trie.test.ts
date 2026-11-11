import { describe, it, expect } from 'vitest';
import { buildTrie, decodeTrie, encodeTrie } from '@solver-suite/word-data/trie';
import { searchPartials } from '../src/lib/trie';

const fixture = ['care', 'cart', 'race', 'acre', 'cape', 'pace', 'carpet', 'crate', 'trace', 'react', 'acca'];

describe('searchPartials', () => {
  const trie = decodeTrie(encodeTrie(buildTrie(fixture)));

  it('groups by length, longest first, alphabetical, excluding the input length', () => {
    const groups = searchPartials(trie, 'carpet');
    expect(groups.map((g) => g.length)).toEqual([5, 4]);
    expect(groups[0]!.words).toEqual(['crate', 'react', 'trace']);
    expect(groups[1]!.words).toEqual(['acre', 'cape', 'care', 'cart', 'pace', 'race']);
    expect(groups.flatMap((g) => g.words)).not.toContain('carpet');
  });

  it('respects repeated letters', () => {
    const notEnough = searchPartials(trie, 'aabcd').flatMap((g) => g.words);
    expect(notEnough).not.toContain('acca');
    const enough = searchPartials(trie, 'aaccd');
    expect(enough.find((g) => g.length === 4)!.words).toContain('acca');
  });

  it('returns nothing for inputs shorter than four letters', () => {
    expect(searchPartials(trie, 'abc')).toEqual([]);
  });
});
