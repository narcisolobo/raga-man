import { describe, it, expect } from 'vitest';
import { presentExact } from '../src/lib/exact-view';

describe('presentExact', () => {
  it('lists every match when the input is not itself a word', () => {
    expect(presentExact(['carpet'], 'cartep')).toEqual({
      words: ['carpet'],
      heading: 'Exact matches',
      openPartials: false,
    });
  });

  it('opens partials with the plain heading when nothing matches', () => {
    expect(presentExact([], 'tcaorpe')).toEqual({
      words: [],
      heading: 'No exact matches',
      openPartials: true,
    });
  });

  it('hides the input and says "Other" when other anagrams remain', () => {
    expect(presentExact(['enlist', 'inlets', 'listen', 'silent', 'tinsel'], 'listen')).toEqual({
      words: ['enlist', 'inlets', 'silent', 'tinsel'],
      heading: 'Other exact matches',
      openPartials: false,
    });
  });

  it('treats a word whose only match is itself as no other matches and opens partials', () => {
    expect(presentExact(['firework'], 'firework')).toEqual({
      words: [],
      heading: 'No other exact matches',
      openPartials: true,
    });
  });

  it('does not mutate the matches it is given', () => {
    const matches = ['acre', 'care', 'race'];
    presentExact(matches, 'race');
    expect(matches).toEqual(['acre', 'care', 'race']);
  });
});
