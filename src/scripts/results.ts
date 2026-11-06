import { loadExact } from '../lib/data';
import { findExact } from '../lib/exact';
import { normalizeLetters } from '../lib/letters';

const letters = normalizeLetters(new URLSearchParams(location.search).get('letters') ?? '');
if (!letters) {
  location.replace('/');
} else {
  const display = document.getElementById('letters-display')!;
  const editButton = document.getElementById('edit-letters')!;
  const editForm = document.getElementById('edit-form') as HTMLFormElement;
  const editInput = document.getElementById('edit-input') as HTMLInputElement;
  const exactSection = document.getElementById('exact-section')!;

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

  const exact = findExact(await loadExact(), letters);
  const heading = document.createElement('h2');
  heading.textContent = exact.length > 0 ? 'Exact matches' : 'No exact matches';
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
}
