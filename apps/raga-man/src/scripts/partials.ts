import type { PartialGroup } from '../lib/trie';

const wordItems = (words: string[]): HTMLLIElement[] =>
  words.map((word) => {
    const li = document.createElement('li');
    li.textContent = word;
    return li;
  });

const countLabel = (n: number): string => `${n} ${n === 1 ? 'word' : 'words'}`;

/** One short sentence for a status region, so the lists themselves never need to be announced. */
export function summarizePartials(groups: PartialGroup[]): string {
  const total = groups.reduce((sum, group) => sum + group.words.length, 0);
  if (total === 0) return 'No partial anagrams.';
  const matches = `${total} partial ${total === 1 ? 'anagram' : 'anagrams'}`;
  return `${matches} in ${groups.length} ${groups.length === 1 ? 'group' : 'groups'}.`;
}

/**
 * Replace the container's contents with one labeled list per length group.
 * Returns the element to move focus to when the visitor asked for these results.
 */
export function renderPartialGroups(container: HTMLElement, groups: PartialGroup[], pageSize = 50): HTMLElement | null {
  container.replaceChildren();
  if (groups.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-note';
    p.textContent = 'No partial anagrams';
    p.tabIndex = -1;
    container.append(p);
    return p;
  }
  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'group';

    // The count sits beside the heading, never inside it: the h3 stays "N letters".
    const head = document.createElement('div');
    head.className = 'group-head';
    const heading = document.createElement('h3');
    heading.textContent = `${group.length} letters`;
    heading.tabIndex = -1;
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = countLabel(group.words.length);
    head.append(heading, count);

    const list = document.createElement('ul');
    list.className = 'word-list';
    list.append(...wordItems(group.words.slice(0, pageSize)));
    section.append(head, list);
    if (group.words.length > pageSize) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'btn-secondary';
      more.textContent = 'Show more';
      more.addEventListener('click', () => {
        const added = wordItems(group.words.slice(pageSize));
        list.append(...added);
        more.remove();
        // The button had focus and is gone: hand focus to the first new word.
        added[0].tabIndex = -1;
        added[0].focus();
      });
      section.append(more);
    }
    container.append(section);
  }
  return container.querySelector<HTMLElement>('h3');
}
