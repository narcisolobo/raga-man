import type { SearchResults } from '../lib/search';

const countLabel = (n: number): string => `${n} ${n === 1 ? 'word' : 'words'}`;

/** A section whose heading has its count beside it, never inside it, so the heading stays short. */
function sectionWithCount(tag: 'h2' | 'h3', id: string, title: string, count: number): HTMLElement {
  const section = document.createElement('section');
  section.setAttribute('aria-labelledby', id);
  const head = document.createElement('div');
  head.className = 'group-head';
  const heading = document.createElement(tag);
  heading.id = id;
  heading.textContent = title;
  head.append(heading);
  // An empty section says so in a note below, so "0 words" would only repeat it.
  if (count > 0) {
    const counter = document.createElement('span');
    counter.className = 'group-count';
    counter.textContent = countLabel(count);
    head.append(counter);
  }
  section.append(head);
  return section;
}

function addNote(section: HTMLElement, text: string): void {
  const note = document.createElement('p');
  note.className = 'empty-note';
  note.textContent = text;
  section.append(note);
}

function addWordList(section: HTMLElement, words: string[], pageSize: number, className: 'word-rows' | 'word-list'): void {
  const list = document.createElement('ul');
  list.className = className;
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
  const pangrams = sectionWithCount('h2', 'pangrams', 'Pangrams', allSeven.length);
  container.replaceChildren(pangrams);
  if (total === 0) {
    addNote(pangrams, 'No words match these letters.');
    return;
  }
  if (allSeven.length) addWordList(pangrams, allSeven, pageSize, 'word-rows');
  else addNote(pangrams, 'No pangrams.');

  if (!groups.length) return;
  const other = document.createElement('section');
  other.setAttribute('aria-labelledby', 'other-words');
  const title = document.createElement('h2');
  title.id = 'other-words';
  // Screen readers get the grouping; sighted readers see each length group's
  // own ruled label, as on raga-man, without a second rule stacked above it.
  title.className = 'sr-only';
  title.textContent = 'Other words';
  other.append(title);
  for (const { length, words } of groups) {
    const group = sectionWithCount('h3', `words-${length}`, `${length} letters`, words.length);
    group.className = 'group';
    addWordList(group, words, pageSize, 'word-list');
    other.append(group);
  }
  container.append(other);
}
