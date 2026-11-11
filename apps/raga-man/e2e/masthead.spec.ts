import { test, expect } from '@playwright/test';

const results = '/results?letters=listen';

test('the name links home from the results page', async ({ page }) => {
  await page.goto(results);
  const link = page.locator('.mast-name a');
  await expect(link).toHaveText('raga-man');
  await expect(link).toHaveAttribute('href', '/');
  await link.click();
  await expect(page).toHaveURL(/\/$/);
});

test('the name is plain text on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mast-name')).toHaveText('raga-man');
  await expect(page.locator('.mast-name a')).toHaveCount(0);
});

test('the name link meets the touch target size', async ({ page }) => {
  await page.goto(results);
  const box = await page.locator('.mast-name a').boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test('the name link looks like the title until hovered', async ({ page }) => {
  await page.goto(results);
  const link = page.locator('.mast-name a');
  const colors = await link.evaluate((a) => [getComputedStyle(a).color, getComputedStyle(a.parentElement!).color]);
  expect(colors[0]).toBe(colors[1]);
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await link.hover();
  await expect(link).toHaveCSS('text-decoration-line', 'underline');
});

test('the link does not change the masthead height', async ({ page }) => {
  const mastHeight = async (path: string) => {
    await page.goto(path);
    return (await page.locator('.mast').boundingBox())!.height;
  };
  expect(await mastHeight(results)).toBeCloseTo(await mastHeight('/'), 0);
});
