// @vitest-environment happy-dom
import { expect, it } from 'vitest';
import { renderResults } from '../src/scripts/word-groups';

it('paginates both kinds of lists, preserving counts and handing off focus', () => {
  const container = document.createElement('div');
  document.body.append(container);
  const allSeven = Array.from({ length: 120 }, (_, index) => `seven-${index}`);
  const words = Array.from({ length: 120 }, (_, index) => `other-${index}`);
  const results = { allSeven, groups: [{ length: 7, words }], total: 240 };
  renderResults(container, results);
  renderResults(container, results);
  const sections = container.querySelectorAll('section[aria-labelledby]');
  expect(sections).toHaveLength(3);
  for (const [section, firstNew, heading] of [
    [sections[0]!, allSeven[50], 'Pangrams'],
    [sections[2]!, words[50], '7 letters'],
  ] as const) {
    expect(section.querySelector('h2, h3')?.textContent).toBe(heading);
    expect(section.querySelectorAll('li')).toHaveLength(50);
    section.querySelector('button')?.click();
    expect(section.querySelectorAll('li')).toHaveLength(120);
    expect(section.querySelector('button')).toBeNull();
    expect(document.activeElement?.textContent).toBe(firstNew);
  }
  container.remove();
});

it('shows a single empty-state explanation when no words match', () => {
  const container = document.createElement('div');
  renderResults(container, { allSeven: [], groups: [], total: 0 });
  expect(container.textContent).toContain('Pangrams');
  expect(container.textContent).toContain('No words match these letters.');
  expect(container.querySelector('h3')).toBeNull();
});
