import type { SearchResults } from '../lib/search';

function sectionWithHeading(tag: 'h2' | 'h3', id: string, title: string): HTMLElement {
  const section = document.createElement('section');
  const heading = document.createElement(tag);
  heading.id = id;
  heading.textContent = title;
  section.setAttribute('aria-labelledby', id);
  section.append(heading);
  return section;
}

function addNote(section: HTMLElement, text: string): void {
  const note = document.createElement('p');
  note.textContent = text;
  section.append(note);
}

function addWordList(section: HTMLElement, words: string[], pageSize: number): void {
  const list = document.createElement('ul');
  list.className = 'word-list';
  list.setAttribute('role', 'list');

  function appendWords(visible: string[]): HTMLLIElement[] {
    const rows = visible.map((word) => {
      const item = document.createElement('li');
      item.textContent = word;
      return item;
    });
    list.append(...rows);
    return rows;
  }

  appendWords(words.slice(0, pageSize));
  section.append(list);
  if (words.length <= pageSize) return;

  const more = document.createElement('button');
  more.className = 'btn-secondary';
  more.type = 'button';
  more.textContent = 'Show more';
  more.addEventListener('click', () => {
    const [first] = appendWords(words.slice(pageSize));
    if (first) {
      first.tabIndex = -1;
      first.focus();
    }
    more.remove();
  });
  section.append(more);
}

export function renderResults(container: HTMLElement, results: SearchResults, pageSize = 50): void {
  const { allSeven, groups, total } = results;
  const all = sectionWithHeading('h2', 'all-seven', `All seven letters (${allSeven.length})`);
  container.replaceChildren(all);
  if (total === 0) {
    addNote(all, 'No words match these letters.');
    return;
  }
  if (allSeven.length) {
    addNote(all, 'These words may repeat letters and may be longer than seven characters.');
    addWordList(all, allSeven, pageSize);
  } else {
    addNote(all, 'No words use all seven letters.');
  }

  if (!groups.length) return;
  const other = sectionWithHeading('h2', 'other-words', 'Other words');
  for (const { length, words } of groups) {
    const group = sectionWithHeading('h3', `words-${length}`, `${length} letters (${words.length})`);
    addWordList(group, words, pageSize);
    other.append(group);
  }
  container.append(other);
}
