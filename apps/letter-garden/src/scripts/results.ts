import { loadTrie } from '../lib/data';
import { renderStaticSquares } from '@solver-suite/ui/squares';
import { entryOrder, puzzleUrl, readPuzzle } from '../lib/puzzle';
import { findWords } from '../lib/search';
import { mountPuzzleForm } from './puzzle-form';
import { renderResults } from './word-groups';

export function mountResults(): void {
  const url = new URL(window.location.href);
  const result = readPuzzle(url.searchParams);
  const heading = document.querySelector<HTMLElement>('#results-heading')!;
  if (!result.ok) {
    heading.textContent = 'Check your letters';
    heading.classList.remove('sr-only');
    document.querySelector<HTMLElement>('#invalid-puzzle')!.hidden = false;
    const repair = mountPuzzleForm(document.querySelector<HTMLFormElement>('#repair-form')!);
    // Keep the field exactly as the link gave it, so the error describes what the visitor sees.
    repair.reset(url.searchParams.get('letters') ?? '', '');
    repair.showError(result.field, result.message);
    return;
  }

  const { puzzle } = result;
  const canonical = puzzleUrl(puzzle);
  if (url.pathname + url.search !== canonical) history.replaceState(history.state, '', canonical + url.hash);

  const summary = document.querySelector<HTMLElement>('#puzzle-summary')!;
  const squares = document.querySelector<HTMLElement>('#summary-squares')!;
  const required = document.querySelector<HTMLElement>('#summary-required')!;
  const edit = document.querySelector<HTMLButtonElement>('#edit-puzzle')!;
  const editPanel = document.querySelector<HTMLElement>('#edit-puzzle-panel')!;
  const editForm = document.querySelector<HTMLFormElement>('#edit-form')!;
  const cancel = editForm.querySelector<HTMLButtonElement>('[data-cancel]')!;
  const status = document.querySelector<HTMLElement>('#results-status')!;
  const retry = document.querySelector<HTMLButtonElement>('#retry-load')!;
  const content = document.querySelector<HTMLElement>('#results-content')!;
  const form = mountPuzzleForm(editForm, puzzle);
  let loading = false;

  renderStaticSquares(squares, entryOrder(puzzle).toUpperCase());
  squares.firstElementChild?.classList.add('is-center');
  required.textContent = `Required letter ${puzzle.required.toUpperCase()}. Letters ${[...puzzle.letters.toUpperCase()].join(' ')}.`;
  summary.hidden = false;

  function closeEdit(): void {
    editPanel.hidden = true;
    summary.hidden = false;
    edit.focus();
  }

  edit.addEventListener('click', () => {
    form.reset(puzzle.letters, puzzle.required);
    summary.hidden = true;
    editPanel.hidden = false;
    form.input.focus();
  });
  cancel.addEventListener('click', closeEdit);
  editForm.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !event.isComposing) closeEdit();
  });

  async function showWords(fromRetry = false): Promise<void> {
    if (loading) return;
    loading = true;
    retry.disabled = true;
    content.replaceChildren();
    status.classList.remove('sr-only');
    status.textContent = 'Finding words…';

    try {
      const root = await loadTrie();
      const results = findWords(root, puzzle);
      renderResults(content, results);
      // Each section shows its own count, and a total from a general dictionary
      // rarely matches the game's, so the total is announced but not shown.
      status.classList.add('sr-only');
      status.textContent = `${results.total} ${results.total === 1 ? 'word' : 'words'} found.`;
      const recoverFocus = fromRetry && (document.activeElement === retry || document.activeElement === document.body);
      retry.hidden = true;
      if (recoverFocus) {
        const firstHeading = content.querySelector('h2')!;
        firstHeading.tabIndex = -1;
        firstHeading.focus();
      }
    } catch {
      status.textContent = 'The word list could not load.';
      retry.hidden = false;
    } finally {
      retry.disabled = false;
      loading = false;
    }
  }

  retry.addEventListener('click', () => void showWords(true));
  void showWords();
}
