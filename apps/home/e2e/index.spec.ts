import { test, expect } from '@playwright/test';
import { SOLVERS } from '../src/solvers';

test('the masthead name is plain text on the index itself', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mast-name')).toHaveText('solver suite');
  await expect(page.locator('.mast-name a')).toHaveCount(0);
});

test('every solver is listed with its icon, name and pitch, linking to its subdomain', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('.solvers a');
  await expect(rows).toHaveCount(SOLVERS.length);
  for (const [index, solver] of SOLVERS.entries()) {
    const row = rows.nth(index);
    await expect(row).toHaveAttribute('href', solver.url);
    await expect(row.locator('.solver-name')).toHaveText(solver.name);
    await expect(row.locator('.solver-pitch')).toHaveText(solver.pitch);
    await expect(row.locator('.solver-icon svg')).toHaveAttribute('aria-hidden', 'true');
    // The link's name is the words, not the icon.
    await expect(row).toHaveAccessibleName(`${solver.name} ${solver.pitch}`);
  }
});

test('each row meets the touch target size', async ({ page }) => {
  await page.goto('/');
  for (const row of await page.locator('.solvers a').all()) {
    const box = (await row.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test('the icons follow the theme toggle, not only the system setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const tile = page.locator('.solver-icon svg rect').first();
  const ink = () => page.evaluate(() => getComputedStyle(document.body).color);
  const lightInk = await ink();
  await expect(tile).toHaveCSS('fill', lightInk);

  await page.click('#theme-toggle');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const darkInk = await ink();
  expect(darkInk).not.toBe(lightInk);
  await expect(tile).toHaveCSS('fill', darkInk);
});

test('nothing scrolls sideways on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});
