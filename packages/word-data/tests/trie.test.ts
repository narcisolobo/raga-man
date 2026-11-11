import { describe, it, expect } from 'vitest';
import { buildTrie, decodeTrie, encodeTrie } from '@solver-suite/word-data/trie';

const fixture = ['care', 'cart', 'race', 'acre', 'cape', 'pace', 'carpet', 'crate', 'trace', 'react', 'acca'];

describe('encodeTrie / decodeTrie', () => {
  it('encodes in the compact grammar', () => {
    expect(encodeTrie(buildTrie(['care', 'cart']))).toBe('c(a(r(e$t$)))');
  });
  it('round-trips the fixture', () => {
    const encoded = encodeTrie(buildTrie(fixture));
    expect(encodeTrie(decodeTrie(encoded))).toBe(encoded);
  });
});
