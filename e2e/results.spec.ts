import { test, expect } from '@playwright/test';

const exactWords = (page: import('@playwright/test').Page) =>
  page.locator('#exact-section li').allTextContents();

test('the input itself is hidden from exact matches and the heading says so', async ({ page }) => {
  await page.goto('/results?letters=listen');
  await expect(page.locator('#exact-section h2')).toHaveText('Other exact matches');
  const words = await exactWords(page);
  expect(words).toContain('silent');
  expect(words).not.toContain('listen');
  await expect(page.locator('#partials-button')).toBeVisible();
});

test('a word with no other anagrams opens partials automatically', async ({ page }) => {
  await page.goto('/results?letters=firework');
  await expect(page.locator('#exact-section h2')).toHaveText('No other exact matches');
  await expect(page.locator('#exact-section li')).toHaveCount(0);
  await expect(page.locator('#partials-section h3').first()).toBeVisible();
  await expect(page.locator('#partials-button')).toBeHidden();
});

test('an exact heading with no words leaves no dead space beneath it', async ({ page }) => {
  for (const letters of ['firework', 'ab']) {
    await page.goto(`/results?letters=${letters}`);
    await expect(page.locator('#exact-section h2')).toBeVisible();
    // Just the heading and its rule: well under the room reserved while loading.
    const box = await page.locator('#exact-section').boundingBox();
    expect(box!.height).toBeLessThan(50);
  }
});

test('a non-word keeps the plain exact heading', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  await expect(page.locator('#exact-section h2')).toHaveText('Exact matches');
  expect(await exactWords(page)).toEqual(['carpet']);
});

test('each partial group shows its total word count beside the heading', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  await page.click('#partials-button');
  const first = page.locator('#partials-section .group').first();
  await expect(first.locator('h3')).toHaveText('5 letters');
  const count = await first.locator('.group-count').textContent();
  expect(count).toMatch(/^\d+ words?$/);
  const shown = await first.locator('li').count();
  expect(Number.parseInt(count!, 10)).toBeGreaterThanOrEqual(shown);
});

test('the submitted letters show as filled squares only, with an accessible name', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  await expect(page.locator('#letters-display .sq')).toHaveCount(6);
  await expect(page.locator('#page-title')).toHaveText('Results for cartep');
  await expect(page.locator('#letters-display')).toHaveCSS('text-transform', 'uppercase');
});

test('the partial lists are not a live region; a short status says what arrived', async ({ page }) => {
  await page.goto('/results?letters=elgnarts');
  await page.click('#partials-button');
  await expect(page.locator('#partials-section .group').first()).toBeVisible();
  await expect(page.locator('#partials-section')).not.toHaveAttribute('aria-live', /.*/);
  await expect(page.locator('#partials-status')).toHaveText(/^\d+ partial matches in \d+ groups\.$/);
});

test('opening partials moves focus to the first group heading instead of dropping it', async ({ page }) => {
  await page.goto('/results?letters=elgnarts');
  await page.click('#partials-button');
  await expect(page.locator('#partials-section h3').first()).toBeFocused();
});

test('partials that open on their own do not steal focus', async ({ page }) => {
  await page.goto('/results?letters=firework');
  await expect(page.locator('#partials-section h3').first()).toBeVisible();
  await expect(page.locator('#partials-section h3').first()).not.toBeFocused();
});

test('"Show more" hands focus to the first newly revealed word', async ({ page }) => {
  await page.goto('/results?letters=elgnarts');
  await page.click('#partials-button');
  const group = page.locator('#partials-section .group').filter({ hasText: '5 letters' });
  await expect(group.locator('li')).toHaveCount(50);
  await group.getByRole('button', { name: 'Show more' }).click();
  await expect(group.locator('li').nth(50)).toBeFocused();
});

test('a failed partials load returns focus to the button', async ({ page }) => {
  await page.route('**/data/trie.txt', (route) => route.abort());
  await page.goto('/results?letters=elgnarts');
  await page.click('#partials-button');
  await expect(page.locator('#partials-section')).toContainText("Couldn't load");
  await expect(page.locator('#partials-button')).toBeFocused();
});

test('there is always exactly one h1, including while editing', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.click('button[aria-label="Edit letters"]');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Results for cartep');
});

test('the no-partials note is separated from the exact section above it', async ({ page }) => {
  await page.goto('/results?letters=ab');
  const exact = await page.locator('#exact-section').boundingBox();
  const note = await page.locator('#partials-section .empty-note').boundingBox();
  expect(note!.y - (exact!.y + exact!.height)).toBeGreaterThanOrEqual(24);
});

test('the pencil meets the touch target size and has a drawn icon', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  const pencil = page.locator('button[aria-label="Edit letters"]');
  const box = await pencil.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await expect(pencil.locator('svg')).toHaveCount(1);
  await expect(pencil).not.toContainText('✎');
});

test('editing: Escape and Cancel both return to the results and restore focus to the pencil', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  const pencil = page.locator('button[aria-label="Edit letters"]');

  await pencil.click();
  await expect(page.locator('#edit-form')).toBeVisible();
  await expect(page.locator('#letters-block')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('#edit-form')).toBeHidden();
  await expect(page.locator('#letters-block')).toBeVisible();
  await expect(pencil).toBeFocused();

  await pencil.click();
  await page.locator('#edit-input').fill('zzzz');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#edit-form')).toBeHidden();
  await expect(pencil).toBeFocused();
  // Cancelling discards the draft: reopening shows the current letters again.
  await pencil.click();
  await expect(page.locator('#edit-input')).toHaveValue('cartep');
});

test('editing with nothing typed stays put and says what to do', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  await page.click('button[aria-label="Edit letters"]');
  await page.locator('#edit-input').fill('');
  await page.click('#edit-form button[type=submit]');
  await expect(page).toHaveURL(/letters=cartep$/);
  await expect(page.locator('#edit-status')).toHaveText('Type some letters first.');
});

test('the edit field uses the same squares as the home page', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  await page.click('button[aria-label="Edit letters"]');
  await expect(page.locator('#edit-squares .sq')).toHaveCount(8);
  await expect(page.locator('#edit-count')).toHaveText('6 / 48');
});

test('shows a loading line, then the result', async ({ page }) => {
  await page.route('**/data/exact.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.continue();
  });
  await page.goto('/results?letters=cartep');
  await expect(page.locator('#exact-section')).toContainText('Looking up words');
  await expect(page.locator('#exact-section h2')).toHaveText('Exact matches');
});

test.describe('theme', () => {
  test.use({ colorScheme: 'dark' });

  test('the toggle and the system setting work on the results page too', async ({ page }) => {
    await page.goto('/results?letters=cartep');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(22, 25, 26)');
    await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-pressed', 'true');
    await page.click('#theme-toggle');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(227, 229, 226)');
  });

  test('a theme chosen on the home page carries over', async ({ page }) => {
    await page.goto('/');
    await page.click('#theme-toggle');
    await page.goto('/results?letters=cartep');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
