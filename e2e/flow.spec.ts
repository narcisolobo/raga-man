import { test, expect } from '@playwright/test';

test('home -> results -> partials -> edit letters', async ({ page }) => {
  await page.goto('/');
  await page.fill('#letters', 'C A R T E P');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/results\?letters=cartep$/);
  await expect(page.locator('#letters-display')).toHaveCSS('text-transform', 'uppercase');
  await expect(page.locator('#exact-section')).toContainText('carpet');

  await page.click('#partials-button');
  const headings = page.locator('#partials-section h3');
  await expect(headings).toHaveText(['5 letters', '4 letters']);

  // Double activation must not duplicate groups.
  await page.evaluate(() => {
    const button = document.getElementById('partials-button') as HTMLButtonElement;
    button.click();
    button.click();
  });
  await expect(headings).toHaveCount(2);

  await page.click('button[aria-label="Edit letters"]');
  await expect(page.locator('#edit-input')).toHaveValue('cartep');
  await expect(page.locator('#edit-input')).toHaveCSS('text-transform', 'uppercase');
  await page.fill('#edit-input', 'RACE');
  await page.click('#edit-form button[type=submit]');
  await expect(page).toHaveURL(/\/results\?letters=race$/);
  await expect(page.locator('#exact-section')).toContainText('care');
});

test('no exact matches opens partials automatically', async ({ page }) => {
  await page.goto('/results?letters=tcaorpe');
  await expect(page.locator('#exact-section')).toContainText('No exact matches');
  await expect(page.locator('#partials-section h3').first()).toHaveText('6 letters');
  await expect(page.locator('#partials-button')).toBeHidden();
});

test('letters-free query goes home', async ({ page }) => {
  await page.goto('/results?letters=%21%21');
  await expect(page).toHaveURL(/\/$/);
});

test('short input shows no matches without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/results?letters=ab');
  await expect(page.locator('#exact-section')).toContainText('No exact matches');
  await expect(page.locator('#partials-section')).toContainText('No partial matches');
  expect(errors).toEqual([]);
});

test('long input is truncated to 48 letters', async ({ page }) => {
  await page.goto('/');
  await page.fill('#letters', 'a'.repeat(60));
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(new RegExp(`letters=a{48}$`));
});

test('a failed trie fetch shows a message and can be retried', async ({ page }) => {
  await page.route('**/data/trie.txt', (route) => route.abort());
  await page.goto('/results?letters=cartep');
  await page.click('#partials-button');
  await expect(page.locator('#partials-section')).toContainText("Couldn't load");
  await expect(page.locator('#partials-button')).toBeVisible();
  await page.unroute('**/data/trie.txt');
  await page.click('#partials-button');
  await expect(page.locator('#partials-section h3').first()).toHaveText('5 letters');
});

test('a failed exact fetch shows a message instead of a blank page', async ({ page }) => {
  await page.route('**/data/exact.json', (route) => route.fulfill({ status: 404, body: 'nope' }));
  await page.goto('/results?letters=carpet');
  await expect(page.locator('#exact-section')).toContainText("Couldn't load");
});
