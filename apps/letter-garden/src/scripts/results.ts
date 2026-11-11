import { loadTrie } from '../lib/data';
import { puzzleUrl, readPuzzle } from '../lib/puzzle';
import { findWords } from '../lib/search';
import { mountPuzzleForm } from './puzzle-form';
import { renderResults } from './word-groups';

export function mountResults(): void {
  const url = new URL(window.location.href);
  const result = readPuzzle(url.searchParams);
  const heading = document.querySelector<HTMLElement>('#results-heading')!;
  if (!result.ok) {
    heading.textContent = 'Check your letters';
    document.querySelector<HTMLElement>('#invalid-puzzle')!.hidden = false;
    const repair = mountPuzzleForm(document.querySelector<HTMLFormElement>('#repair-form')!);
    repair.reset(url.searchParams.get('letters') ?? '', url.searchParams.get('required')?.toLowerCase() ?? '');
    repair.showError(result.field, result.message);
    return;
  }

  const { puzzle } = result;
  const canonical = puzzleUrl(puzzle);
  if (url.pathname + url.search !== canonical) history.replaceState(history.state, '', canonical + url.hash);

  const summary = document.querySelector<HTMLElement>('#puzzle-summary')!;
  const letters = document.querySelector<HTMLElement>('#summary-letters')!;
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

  letters.textContent = [...puzzle.letters.toUpperCase()].join(' ');
  required.textContent = `Required letter ${puzzle.required.toUpperCase()}`;
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
    status.textContent = 'Finding words…';

    try {
      const root = await loadTrie();
      const results = findWords(root, puzzle);
      renderResults(content, results);
      status.textContent = `${results.total} ${results.total === 1 ? 'word' : 'words'} found. ${results.allSeven.length} use all seven letters.`;
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
