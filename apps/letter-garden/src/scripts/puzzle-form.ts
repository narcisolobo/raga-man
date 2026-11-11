import { puzzleUrl, readLetters, validatePuzzle, type Puzzle } from '../lib/puzzle';

export function mountPuzzleForm(form: HTMLFormElement, initial?: Puzzle) {
  const input = form.querySelector<HTMLInputElement>('input[name=letters]')!;
  const fieldset = form.querySelector<HTMLFieldSetElement>('[data-required-field]')!;
  const choices = form.querySelector<HTMLElement>('[data-required-letters]')!;
  const hint = form.querySelector<HTMLElement>('[data-selector-hint]')!;
  const note = form.querySelector<HTMLElement>('[data-letters-note]')!;
  const lettersError = form.querySelector<HTMLElement>('[data-letters-error]')!;
  const requiredError = form.querySelector<HTMLElement>('[data-required-error]')!;
  let renderedLetters = '';
  let composing = false;

  function selectedLetter(): string {
    return choices.querySelector<HTMLInputElement>('input:checked')?.value ?? '';
  }

  function refresh(required = selectedLetter()): void {
    const entry = readLetters(input.value);
    if (note.textContent !== entry.note) note.textContent = entry.note;
    const letters = entry.message ? '' : [...entry.letters].sort().join('');
    if (letters !== renderedLetters) {
      renderedLetters = letters;
      const options = [...letters].map((letter) => {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'required';
        radio.value = letter;
        radio.setAttribute('aria-describedby', requiredError.id);
        const tile = document.createElement('span');
        tile.textContent = letter.toUpperCase();
        label.append(radio, tile);
        return label;
      });
      choices.replaceChildren(...options);
    }
    hint.hidden = !!letters;
    for (const radio of choices.querySelectorAll('input')) radio.checked = radio.value === required;
  }

  function clearErrors(): void {
    lettersError.textContent = '';
    requiredError.textContent = '';
    input.removeAttribute('aria-invalid');
    fieldset.removeAttribute('aria-invalid');
  }

  function showError(field: 'letters' | 'required', message: string, focus = false): void {
    const target = field === 'letters' ? input : fieldset;
    const error = field === 'letters' ? lettersError : requiredError;
    target.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    if (focus) {
      const firstRadio = choices.querySelector<HTMLInputElement>('input');
      (field === 'required' && firstRadio ? firstRadio : target).focus();
    }
  }

  function reset(letters: string, required: string): void {
    input.value = letters;
    clearErrors();
    refresh(required);
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
  choices.addEventListener('change', clearErrors);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (composing) return;
    clearErrors();
    const result = validatePuzzle(input.value, selectedLetter());
    if (result.ok) window.location.assign(puzzleUrl(result.puzzle));
    else showError(result.field, result.message, true);
  });

  reset(initial?.letters ?? input.value, initial?.required ?? '');
  return { input, reset, showError };
}
