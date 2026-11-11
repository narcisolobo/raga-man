import { buildTrie, encodeTrie } from '@solver-suite/word-data/trie';
import { expect, test } from '@playwright/test';

const puzzle = '/results?letters=acinort&required=c';

for (const query of [
  '',
  'letters=acnort&required=c',
  'letters=aacnort&required=c',
  'letters=acinortx&required=c',
  'letters=acinort&required=x',
  'letters=acinort',
  'letters=acinort&required=c&required=c',
]) {
  test(`invalid URL is editable without fetching data (${query || 'empty query'})`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/data/trie.txt')) requests.push(request.url());
    });
    await page.goto('/results?' + query);
    await expect(page.getByRole('heading', { name: 'Check your letters' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Puzzle letters' })).toHaveValue(new URLSearchParams(query).get('letters') ?? '');
    await expect(page.locator('#results-content')).toBeEmpty();
    expect(requests).toEqual([]);
  });
}

test('canonicalizes valid links and edits the required letter', async ({ page }) => {
  await page.goto('/results?letters=TRO%20NICA&required=C&extra=1');
  await expect(page).toHaveURL(puzzle);
  const edit = page.getByRole('button', { name: 'Edit letters' });
  await edit.click();
  const letters = page.getByRole('textbox', { name: 'Puzzle letters' });
  await expect(letters).toBeFocused();
  await letters.press('Escape');
  await expect(edit).toBeFocused();
  await edit.click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(edit).toBeFocused();
  await edit.click();
  await page.getByRole('radio', { name: 'R', exact: true }).check();
  await page.getByRole('button', { name: 'Solve' }).click();
  await expect(page).toHaveURL('/results?letters=acinort&required=r');
  await expect(page.getByText('ration', { exact: true })).toBeVisible();
});

test('retries a failed fetch once and focuses the results', async ({ page }) => {
  let requests = 0;
  await page.route('**/data/trie.txt', (route) => {
    requests++;
    return requests === 1 ? route.fulfill({ status: 503 }) : route.continue();
  });
  await page.goto(puzzle);
  await expect(page.getByRole('status')).toHaveText('The word list could not load.');
  await page.getByRole('button', { name: 'Retry' }).focus();
  await page.keyboard.press('Enter');
  const heading = page.getByRole('heading', { name: /All seven letters/ });
  await expect(heading).toHaveCount(1);
  await expect(heading).toBeFocused();
  expect(requests).toBe(2);
});

test('paginates a fixture group and handles empty results', async ({ page }) => {
  const words = Array.from({ length: 64 }, (_, index) => 'c' + index.toString(2).padStart(6, '0').replaceAll('0', 'a').replaceAll('1', 'i'));
  await page.route('**/data/trie.txt', (route) => route.fulfill({ body: encodeTrie(buildTrie(words)) }));
  await page.goto(puzzle);
  await expect(page.getByText('No words use all seven letters.')).toBeVisible();
  const group = page.getByRole('region', { name: '7 letters (64)' });
  await expect(group.getByRole('listitem')).toHaveCount(50);
  await group.getByRole('button', { name: 'Show more' }).click();
  await expect(group.getByRole('listitem')).toHaveCount(64);
  await expect(group.getByRole('listitem').nth(50)).toBeFocused();
  await page.goto('/results?letters=acinort&required=r');
  await expect(page.getByText('No words match these letters.')).toBeVisible();
});

test('persists the theme and remains usable on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Dark mode' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await page.getByRole('link', { name: 'Try an example' }).click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('heading', { name: /All seven letters/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('follows system changes and toggles when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new DOMException('Storage is blocked', 'SecurityError'); },
    });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(puzzle);
  const toggle = page.getByRole('button', { name: 'Dark mode' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('keeps labels and controls usable at twice the normal scale', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  await page.getByRole('textbox', { name: 'Puzzle letters' }).fill('acinort');
  const radio = page.getByRole('radio', { name: 'C', exact: true });
  await radio.check();
  await expect(radio).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(640);
  await page.getByRole('button', { name: 'Solve' }).click();
  await expect(page).toHaveURL(puzzle);
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  await expect(page.getByRole('heading', { name: /All seven letters/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(640);
});
