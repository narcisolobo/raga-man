import { syncSquares } from '@solver-suite/ui/squares';
import { MAX_LETTERS } from '../lib/letters';
import { readEntry, entryNote } from '../lib/entry';

export { renderStaticSquares } from '@solver-suite/ui/squares';

/** Squares per row; matches --squares-per-row in the shared stylesheet (default 8). */
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
    syncSquares(squares, entry.letters, wanted, entry.active);

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
