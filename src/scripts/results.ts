import { loadExact, loadTrie } from '../lib/data';
import { findExact } from '../lib/exact';
import { presentExact } from '../lib/exact-view';
import { normalizeLetters } from '../lib/letters';
import { searchPartials } from '../lib/trie';
import { mountLetterField, renderStaticSquares } from './letter-field';
import { renderPartialGroups, summarizePartials } from './partials';

const LOAD_ERROR = "Couldn't load the word list. Check your connection and try again.";

const letters = normalizeLetters(new URLSearchParams(location.search).get('letters') ?? '');
if (!letters) {
  location.replace('/');
} else {
  const lettersBlock = document.getElementById('letters-block')!;
  const display = document.getElementById('letters-display')!;
  const pageTitle = document.getElementById('page-title')!;
  const partialsStatus = document.getElementById('partials-status')!;
  const editButton = document.getElementById('edit-letters') as HTMLButtonElement;
  const editForm = document.getElementById('edit-form') as HTMLFormElement;
  const editInput = document.getElementById('edit-input') as HTMLInputElement;
  const editStatus = document.getElementById('edit-status')!;
  const editCancel = document.getElementById('edit-cancel') as HTMLButtonElement;
  const exactSection = document.getElementById('exact-section')!;
  const partialsButton = document.getElementById('partials-button') as HTMLButtonElement;
  const partialsSection = document.getElementById('partials-section')!;

  renderStaticSquares(display, letters);
  pageTitle.textContent = `Results for ${letters}`;

  const field = mountLetterField({
    input: editInput,
    squares: document.getElementById('edit-squares')!,
    count: document.getElementById('edit-count'),
    status: editStatus,
  });

  function openEdit(): void {
    editInput.value = letters;
    lettersBlock.hidden = true;
    editForm.hidden = false;
    editInput.focus();
    editInput.setSelectionRange(letters.length, letters.length);
    field.render();
  }
  function closeEdit(): void {
    editForm.hidden = true;
    lettersBlock.hidden = false;
    editStatus.textContent = '';
    editButton.focus();
  }

  editButton.addEventListener('click', openEdit);
  editCancel.addEventListener('click', closeEdit);
  editForm.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeEdit();
  });
  editForm.addEventListener('submit', (event) => {
    const next = normalizeLetters(editInput.value);
    if (!next) {
      event.preventDefault();
      // Focus first: focusing re-renders, which would clear the message.
      editInput.focus();
      editStatus.textContent = 'Type some letters first.';
      return;
    }
    editInput.value = next;
  });

  // Show a plain line while the word list loads, so nothing jumps when it arrives.
  const loading = document.createElement('p');
  loading.className = 'empty-note';
  loading.textContent = 'Looking up words…';
  exactSection.classList.add('is-loading');
  exactSection.replaceChildren(loading);

  let openPartials = false;
  let exactFailed = false;
  try {
    const view = presentExact(findExact(await loadExact(), letters), letters);
    exactSection.classList.remove('is-loading');
    openPartials = view.openPartials;
    const heading = document.createElement('h2');
    heading.className = 'section-title';
    heading.textContent = view.heading;
    exactSection.replaceChildren(heading);
    if (view.note) {
      const note = document.createElement('p');
      note.className = 'empty-note';
      note.textContent = view.note;
      exactSection.append(note);
    }
    if (view.words.length > 0) {
      const list = document.createElement('ul');
      list.className = 'exact-list';
      for (const word of view.words) {
        const item = document.createElement('li');
        item.textContent = word;
        list.append(item);
      }
      exactSection.append(list);
    }
  } catch {
    exactFailed = true;
    exactSection.classList.remove('is-loading');
    const message = document.createElement('p');
    message.className = 'error-note';
    message.textContent = LOAD_ERROR;
    exactSection.replaceChildren(message);
  }

  let partialsStarted = false;
  /** `userInitiated` is true when the visitor pressed the button: only then does focus move. */
  async function showPartials(userInitiated: boolean): Promise<void> {
    if (partialsStarted) return;
    partialsStarted = true;
    try {
      const groups = searchPartials(await loadTrie(), letters);
      const target = renderPartialGroups(partialsSection, groups);
      // The lists are not a live region (thousands of words); a short status says what arrived.
      partialsStatus.textContent = summarizePartials(groups);
      // The button had focus and is about to hide: move focus on, so it is not dropped to the page.
      partialsButton.hidden = true;
      if (userInitiated) target?.focus();
    } catch {
      const message = document.createElement('p');
      message.className = 'error-note';
      message.textContent = LOAD_ERROR;
      partialsSection.replaceChildren(message);
      partialsStarted = false;
      partialsButton.hidden = false;
      if (userInitiated) partialsButton.focus();
    }
  }

  if (openPartials && !exactFailed) {
    await showPartials(false);
  } else {
    partialsButton.hidden = false;
    partialsButton.addEventListener('click', () => void showPartials(true));
  }
}
