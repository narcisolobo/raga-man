// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderPartialGroups, summarizePartials } from '../src/scripts/partials';

const words = (n: number, prefix = 'w') => Array.from({ length: n }, (_, i) => `${prefix}${String(i).padStart(3, '0')}`);
let container: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<section id="c"></section>';
  container = document.getElementById('c')!;
});

describe('renderPartialGroups', () => {
  it('renders groups in the given order with length labels', () => {
    renderPartialGroups(container, [
      { length: 6, words: ['aaaaaa'] },
      { length: 5, words: ['bbbbb'] },
      { length: 4, words: ['cccc'] },
    ]);
    const labels = [...container.querySelectorAll('h3')].map((h) => h.textContent);
    expect(labels).toEqual(['6 letters', '5 letters', '4 letters']);
  });

  it('shows the first 50 words and reveals the rest on "Show more"', () => {
    renderPartialGroups(container, [{ length: 4, words: words(120) }]);
    expect(container.querySelectorAll('li')).toHaveLength(50);
    const more = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Show more')!;
    more.click();
    expect(container.querySelectorAll('li')).toHaveLength(120);
    expect([...container.querySelectorAll('button')].some((b) => b.textContent === 'Show more')).toBe(false);
  });

  it('shows each group\'s total word count beside the heading, not inside it', () => {
    renderPartialGroups(container, [
      { length: 5, words: words(120) },
      { length: 4, words: ['cccc'] },
    ]);
    const counts = [...container.querySelectorAll('.group-count')].map((c) => c.textContent);
    expect(counts).toEqual(['120 words', '1 word']);
    // The count is the total, not the 50 shown, and the h3 stays exactly "N letters".
    expect([...container.querySelectorAll('h3')].map((h) => h.textContent)).toEqual(['5 letters', '4 letters']);
    expect(container.querySelector('h3')!.contains(container.querySelector('.group-count'))).toBe(false);
  });

  it('returns the first group heading as the place to move focus', () => {
    const target = renderPartialGroups(container, [
      { length: 5, words: ['bbbbb'] },
      { length: 4, words: ['cccc'] },
    ]);
    expect(target?.textContent).toBe('5 letters');
    expect(target?.tabIndex).toBe(-1);
    expect(renderPartialGroups(container, [])?.textContent).toBe('No partial matches');
  });

  it('hands focus to the first newly revealed word when "Show more" removes itself', () => {
    renderPartialGroups(container, [{ length: 4, words: words(60) }]);
    const more = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Show more')!;
    more.focus();
    more.click();
    expect(document.activeElement?.tagName).toBe('LI');
    expect(document.activeElement?.textContent).toBe('w050');
  });

  it('is idempotent: rendering twice leaves one set of groups', () => {
    const groups = [{ length: 5, words: ['bbbbb'] }];
    renderPartialGroups(container, groups);
    renderPartialGroups(container, groups);
    expect(container.querySelectorAll('h3')).toHaveLength(1);
  });

  it('says so when there are no partial matches', () => {
    renderPartialGroups(container, []);
    expect(container.textContent).toContain('No partial matches');
  });
});

describe('summarizePartials', () => {
  it('says how many matches arrived in how many groups', () => {
    expect(
      summarizePartials([
        { length: 5, words: ['bbbbb', 'ccccc'] },
        { length: 4, words: ['dddd'] },
      ]),
    ).toBe('3 partial matches in 2 groups.');
  });

  it('handles the singular and the empty case', () => {
    expect(summarizePartials([{ length: 4, words: ['cccc'] }])).toBe('1 partial match in 1 group.');
    expect(summarizePartials([])).toBe('No partial matches.');
  });
});
