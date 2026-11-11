import { syncSquares } from '@solver-suite/ui/squares';
import { fieldValue, puzzleUrl, readLetters, validatePuzzle, type Puzzle } from '../lib/puzzle';

/** Squares in a puzzle; the first is the required letter. */
const SIZE = 7;
/** Most squares drawn, so a long paste shows its extras (in error) without filling the page. */
const MAX_SQUARES = SIZE * 3;

export function mountPuzzleForm(form: HTMLFormElement, initial?: Puzzle) {
  const input = form.querySelector<HTMLInputElement>('input[name=letters]')!;
  const squares = form.querySelector<HTMLElement>('[data-squares]')!;
  const count = form.querySelector<HTMLElement>('[data-count]')!;
  const note = form.querySelector<HTMLElement>('[data-letters-note]')!;
  const error = form.querySelector<HTMLElement>('[data-letters-error]')!;
  let composing = false;
  let requiredInvalid = false;

  function refresh(): void {
    const entry = readLetters(input.value);
    if (note.textContent !== entry.note) note.textContent = entry.note;

    const caret = input.selectionStart ?? input.value.length;
    const active = readLetters(input.value.slice(0, Math.max(0, caret))).letters.length;
    const shown = entry.letters.slice(0, MAX_SQUARES);
    const wanted = Math.max(SIZE, Math.ceil(shown.length / SIZE) * SIZE);
    syncSquares(squares, shown, wanted, active);

    const seen = new Set<string>();
    Array.from(squares.children).forEach((square, index) => {
      const letter = shown[index] ?? '';
      const repeated = letter !== '' && seen.has(letter);
      if (letter) seen.add(letter);
      square.classList.toggle('is-center', index === 0);
      square.classList.toggle('is-error', (letter !== '' && (repeated || index >= SIZE)) || (index === 0 && requiredInvalid));
    });
    count.textContent = `${entry.letters.length} / ${SIZE}`;
  }

  function clearErrors(): void {
    error.textContent = '';
    requiredInvalid = false;
    input.removeAttribute('aria-invalid');
  }

  function showError(field: 'letters' | 'required', message: string, focus = false): void {
    input.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    requiredInvalid = field === 'required';
    refresh();
    if (focus) input.focus();
  }

  function reset(letters: string, required: string): void {
    input.value = fieldValue(letters, required);
    clearErrors();
    refresh();
  }

  function updateEntry(): void {
    clearErrors();
    refresh();
  }

  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => {
    composing = false;
    updateEntry();
  });
  input.addEventListener('input', (event) => {
    if (!composing && !(event instanceof InputEvent && event.isComposing)) updateEntry();
  });
  for (const type of ['keyup', 'click', 'focus', 'blur']) input.addEventListener(type, refresh);
  document.addEventListener('selectionchange', () => {
    if (document.activeElement === input) refresh();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (composing) return;
    clearErrors();
    const { letters } = readLetters(input.value);
    const result = validatePuzzle(input.value, letters[0] ?? '');
    if (result.ok) window.location.assign(puzzleUrl(result.puzzle));
    else showError(result.field, result.message, true);
  });

  reset(initial?.letters ?? input.value, initial?.required ?? '');
  return { input, reset, showError };
}
