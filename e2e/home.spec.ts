import { test, expect } from '@playwright/test';

const squareLetters = (page: import('@playwright/test').Page) =>
  page.locator('#squares .sq').evaluateAll((els) => els.map((el) => el.textContent ?? '').join(''));

test('the input is focused on load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#letters')).toBeFocused();
});

test('typed letters appear in the squares, uppercase, with repeats', async ({ page }) => {
  await page.goto('/');
  await page.locator('#letters').pressSequentially('lettters');
  expect(await squareLetters(page)).toBe('lettters');
  await expect(page.locator('#squares .sq').first()).toHaveCSS('text-transform', 'uppercase');
  await expect(page.locator('#count')).toHaveText('8 / 48');
});

test('ignored characters are named in text and do not fill squares', async ({ page }) => {
  await page.goto('/');
  await page.locator('#letters').fill('c-a3r');
  expect(await squareLetters(page)).toBe('car');
  await expect(page.locator('#status')).toContainText('Ignored 2 characters');
});

test('spaces count toward the ignored total once something else is ignored', async ({ page }) => {
  await page.goto('/');
  await page.locator('#letters').fill('l e-t3rs');
  expect(await squareLetters(page)).toBe('letrs');
  await expect(page.locator('#status')).toContainText('Ignored 3 characters');
});

test('an empty first row of eight squares is always shown', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#squares .sq')).toHaveCount(8);
  await page.locator('#letters').fill('abcdefgh');
  await expect(page.locator('#squares .sq')).toHaveCount(16);
});

test('spaces are not reported as ignored', async ({ page }) => {
  await page.goto('/');
  await page.locator('#letters').fill('c a r');
  await expect(page.locator('#status')).toHaveText('');
});

test('letters past the cap are named in text', async ({ page }) => {
  await page.goto('/');
  await page.locator('#letters').fill('a'.repeat(50));
  await expect(page.locator('#count')).toHaveText('48 / 48');
  await expect(page.locator('#status')).toContainText('Only the first 48 letters');
});

test('solving with nothing typed stays put and says what to do', async ({ page }) => {
  await page.goto('/');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#status')).toHaveText('Type some letters first.');
  await expect(page.locator('#letters')).toBeFocused();
});

test('the example link goes straight to results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'PLEATS' }).click();
  await expect(page).toHaveURL(/\/results\?letters=pleats$/);
});

test.describe('theme', () => {
  test.use({ colorScheme: 'dark' });

  test('follows the system setting by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(22, 25, 26)');
    await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-pressed', 'true');
  });

  test('the toggle overrides the system and is remembered', async ({ page }) => {
    await page.goto('/');
    await page.click('#theme-toggle');
    await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(227, 229, 226)');
    await page.reload();
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(227, 229, 226)');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('the toggle meets the touch target size', async ({ page }) => {
    await page.goto('/');
    const box = await page.locator('#theme-toggle').boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test('works when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  const errors: string[] = [];
  // Astro's dev toolbar (only present under `astro dev`) reads localStorage unguarded.
  page.on('pageerror', (e) => {
    if (!e.stack?.includes('dev-toolbar')) errors.push(e.message);
  });
  await page.goto('/');
  await page.click('#theme-toggle');
  await expect(page.locator('#letters')).toBeVisible();
  expect(errors).toEqual([]);
});
