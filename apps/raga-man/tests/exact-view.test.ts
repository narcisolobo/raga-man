import { describe, it, expect } from 'vitest';
import { presentExact } from '../src/lib/exact-view';
import { MIN_WORD_LENGTH } from '../src/lib/letters';

describe('presentExact', () => {
  it('lists every match when the input is not itself a word', () => {
    expect(presentExact(['carpet'], 'cartep')).toEqual({
      words: ['carpet'],
      heading: 'Anagrams',
      openPartials: false,
      note: null,
    });
  });

  it('opens partials when nothing matches', () => {
    expect(presentExact([], 'tcaorpe')).toEqual({
      words: [],
      heading: 'No anagrams',
      openPartials: true,
      note: null,
    });
  });

  it('hides the input when other anagrams remain', () => {
    expect(presentExact(['enlist', 'inlets', 'listen', 'silent', 'tinsel'], 'listen')).toEqual({
      words: ['enlist', 'inlets', 'silent', 'tinsel'],
      heading: 'Anagrams',
      openPartials: false,
      note: null,
    });
  });

  it('treats a word whose only match is itself as no anagrams and opens partials', () => {
    expect(presentExact(['firework'], 'firework')).toEqual({
      words: [],
      heading: 'No anagrams',
      openPartials: true,
      note: null,
    });
  });

  it('does not mutate the matches it is given', () => {
    const matches = ['acre', 'care', 'race'];
    presentExact(matches, 'race');
    expect(matches).toEqual(['acre', 'care', 'race']);
  });
});

describe('presentExact: input too short for any word', () => {
  it('explains why there is nothing to show, for one to three letters only', () => {
    for (const letters of ['a', 'ab', 'abc']) {
      expect(presentExact([], letters).note).toBe('Words need at least four letters.');
    }
    expect(presentExact([], 'abcd').note).toBeNull();
  });

  it('keeps the copy ("four") in step with the real minimum', () => {
    expect(MIN_WORD_LENGTH).toBe(4);
  });
});
