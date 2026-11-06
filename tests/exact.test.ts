import { describe, it, expect } from 'vitest';
import { buildExactIndex, findExact } from '../src/lib/exact';

const fixture = ['care', 'race', 'acre', 'cart', 'trac', 'cape'];

describe('buildExactIndex', () => {
  it('groups words by sorted letters, alphabetically', () => {
    expect(buildExactIndex(fixture)['acer']).toEqual(['acre', 'care', 'race']);
  });
});

describe('findExact', () => {
  const map = new Map(Object.entries(buildExactIndex(fixture)));
  it('finds all anagrams regardless of input order', () => {
    expect(findExact(map, 'ecar')).toEqual(['acre', 'care', 'race']);
  });
  it('returns empty when nothing matches', () => {
    expect(findExact(map, 'zzzz')).toEqual([]);
  });
});
