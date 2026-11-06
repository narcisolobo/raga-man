import { MAX_LETTERS, normalizeLetters } from '../lib/letters';
import { readEntry, entryNote } from '../lib/entry';

const ROW = 8; // squares per row; matches the grid in the page CSS

const form = document.getElementById('solve-form') as HTMLFormElement;
const input = document.getElementById('letters') as HTMLInputElement;
const squares = document.getElementById('squares') as HTMLElement;
const count = document.getElementById('count') as HTMLElement;
const status = document.getElementById('status') as HTMLElement;

function render(): void {
  const entry = readEntry(input.value, input.selectionStart ?? input.value.length);
  // Always a full first row, then whole rows, so the field reads as a grid to fill.
  const wanted = Math.min(MAX_LETTERS, Math.ceil((entry.letters.length + 1) / ROW) * ROW);

  while (squares.children.length > wanted) squares.lastElementChild?.remove();
  while (squares.children.length < wanted) {
    const square = document.createElement('span');
    square.className = 'sq';
    squares.append(square);
  }

  const activeIndex = Math.min(entry.active, wanted - 1);
  Array.from(squares.children).forEach((square, index) => {
    const letter = entry.letters[index] ?? '';
    if ((square as HTMLElement).dataset.letter !== letter) {
      (square as HTMLElement).dataset.letter = letter;
      square.textContent = letter;
      // Restart the pencil-in motion only for the square that changed.
      square.classList.remove('is-new');
      if (letter) {
        void (square as HTMLElement).offsetWidth;
        square.classList.add('is-new');
      }
    }
    square.classList.toggle('is-active', index === activeIndex);
    square.classList.toggle('is-end', index === activeIndex && entry.active > activeIndex);
  });

  count.textContent = `${entry.letters.length} / ${MAX_LETTERS}`;
  status.textContent = entryNote(entry);
}

for (const type of ['input', 'keyup', 'click', 'focus', 'blur']) {
  input.addEventListener(type, render);
}
document.addEventListener('selectionchange', () => {
  if (document.activeElement === input) render();
});

form.addEventListener('submit', (event) => {
  const letters = normalizeLetters(input.value);
  if (!letters) {
    event.preventDefault();
    // Focus first: focusing re-renders, which would clear the message.
    input.focus();
    status.textContent = 'Type some letters first.';
    return;
  }
  input.value = letters;
});

render();
input.focus();
