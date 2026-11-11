import { expect, test } from '@playwright/test';

test('solves a puzzle from the form and preserves the results on refresh', async ({ page }) => {
  const dataRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/data/')) dataRequests.push(request.url());
  });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Puzzle letters' }).fill('C T R O N I A');
  expect(dataRequests).toEqual([]);
  await page.getByRole('button', { name: 'Solve' }).click();
  await expect(page).toHaveURL('/results?letters=acinort&required=c');
  const allSeven = page.getByRole('region', { name: 'Pangrams' });
  await expect(allSeven.getByText('coronation', { exact: true })).toBeVisible();
  await expect(allSeven.getByText('cartoon', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: /7 letters/ }).getByText('cartoon', { exact: true })).toBeVisible();
  await expect(page.getByText('ration', { exact: true })).toHaveCount(0);
  await expect(page.getByText('nectar', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(allSeven.getByText('coronation', { exact: true })).toBeVisible();
});
