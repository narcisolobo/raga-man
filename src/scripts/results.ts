import { loadExact, loadTrie } from '../lib/data';
import { findExact } from '../lib/exact';
import { normalizeLetters } from '../lib/letters';
import { searchPartials } from '../lib/trie';
import { renderPartialGroups } from './partials';

const LOAD_ERROR = "Couldn't load the word list. Check your connection and try again.";

const letters = normalizeLetters(new URLSearchParams(location.search).get('letters') ?? '');
if (!letters) {
  location.replace('/');
} else {
  const display = document.getElementById('letters-display')!;
  const editButton = document.getElementById('edit-letters')!;
  const editForm = document.getElementById('edit-form') as HTMLFormElement;
  const editInput = document.getElementById('edit-input') as HTMLInputElement;
  const exactSection = document.getElementById('exact-section')!;
  const partialsButton = document.getElementById('partials-button') as HTMLButtonElement;
  const partialsSection = document.getElementById('partials-section')!;

  display.textContent = letters;

  editButton.addEventListener('click', () => {
    editInput.value = letters;
    editForm.hidden = false;
    display.hidden = true;
    editButton.hidden = true;
    editInput.focus();
  });
  editForm.addEventListener('submit', (event) => {
    const next = normalizeLetters(editInput.value);
    if (!next) {
      event.preventDefault();
      return;
    }
    editInput.value = next;
  });

  let exact: string[] = [];
  let exactFailed = false;
  try {
    exact = findExact(await loadExact(), letters);
  } catch {
    exactFailed = true;
  }
  const heading = document.createElement('h2');
  heading.textContent = exactFailed ? LOAD_ERROR : exact.length > 0 ? 'Exact matches' : 'No exact matches';
  exactSection.append(heading);
  if (exact.length > 0) {
    const list = document.createElement('ul');
    for (const word of exact) {
      const item = document.createElement('li');
      item.textContent = word;
      list.append(item);
    }
    exactSection.append(list);
  }

  let partialsStarted = false;
  async function showPartials(): Promise<void> {
    if (partialsStarted) return;
    partialsStarted = true;
    partialsButton.hidden = true;
    try {
      renderPartialGroups(partialsSection, searchPartials(await loadTrie(), letters));
    } catch {
      partialsSection.textContent = LOAD_ERROR;
      partialsStarted = false;
      partialsButton.hidden = false;
    }
  }

  if (exact.length === 0 && !exactFailed) {
    await showPartials();
  } else {
    partialsButton.hidden = false;
    partialsButton.addEventListener('click', () => void showPartials());
  }
}
