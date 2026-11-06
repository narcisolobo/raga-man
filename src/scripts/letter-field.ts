import { MAX_LETTERS } from '../lib/letters';
import { readEntry, entryNote } from '../lib/entry';

/** Squares per row; matches the grid in the shared stylesheet. */
const ROW = 8;

interface Parts {
  input: HTMLInputElement;
  squares: HTMLElement;
  count?: HTMLElement | null;
  status?: HTMLElement | null;
}

export interface LetterField {
  render(): void;
}

/**
 * Draws a grid of squares over a real input. The input stays the source of
 * truth (keyboard, IME, paste); the squares only mirror it.
 */
export function mountLetterField({ input, squares, count, status }: Parts): LetterField {
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

    if (count) count.textContent = `${entry.letters.length} / ${MAX_LETTERS}`;
    if (status) status.textContent = entryNote(entry);
  }

  for (const type of ['input', 'keyup', 'click', 'focus', 'blur']) {
    input.addEventListener(type, render);
  }
  document.addEventListener('selectionchange', () => {
    if (document.activeElement === input) render();
  });

  render();
  return { render };
}

/** Fill a container with read-only squares, one per letter and no empty cells. */
export function renderStaticSquares(container: HTMLElement, letters: string): void {
  container.replaceChildren(
    ...[...letters].map((letter) => {
      const square = document.createElement('span');
      square.className = 'sq';
      square.textContent = letter;
      return square;
    }),
  );
}
