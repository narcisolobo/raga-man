import type { PartialGroup } from '../lib/trie';

const wordItems = (words: string[]): HTMLLIElement[] =>
  words.map((word) => {
    const li = document.createElement('li');
    li.textContent = word;
    return li;
  });

/** Replace the container's contents with one labeled list per length group. */
export function renderPartialGroups(container: HTMLElement, groups: PartialGroup[], pageSize = 50): void {
  container.replaceChildren();
  if (groups.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No partial matches';
    container.append(p);
    return;
  }
  for (const group of groups) {
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = `${group.length} letters`;
    const list = document.createElement('ul');
    list.append(...wordItems(group.words.slice(0, pageSize)));
    section.append(heading, list);
    if (group.words.length > pageSize) {
      const more = document.createElement('button');
      more.type = 'button';
      more.textContent = 'Show more';
      more.addEventListener('click', () => {
        list.append(...wordItems(group.words.slice(pageSize)));
        more.remove();
      });
      section.append(more);
    }
    container.append(section);
  }
}
