import { normalizeLetters } from '../lib/letters';
import { mountLetterField } from './letter-field';

const form = document.getElementById('solve-form') as HTMLFormElement;
const input = document.getElementById('letters') as HTMLInputElement;
const status = document.getElementById('status') as HTMLElement;

mountLetterField({
  input,
  squares: document.getElementById('squares') as HTMLElement,
  count: document.getElementById('count'),
  status,
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

input.focus();
