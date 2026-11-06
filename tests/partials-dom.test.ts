// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderPartialGroups } from '../src/scripts/partials';

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
