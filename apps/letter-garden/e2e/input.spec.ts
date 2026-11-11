import { expect, test } from '@playwright/test';

test('validates input and explains what it ignored', async ({ page }) => {
  await page.goto('/');
  const letters = page.getByRole('textbox', { name: 'Puzzle letters' });
  const solve = page.getByRole('button', { name: 'Solve' });
  await letters.fill('aacnort');
  await solve.click();
  await expect(page.getByRole('alert').filter({ hasText: 'Use seven different letters.' })).toBeVisible();
  await expect(letters).toBeFocused();
  await letters.fill('TRO NICA!');
  await expect(page.getByText('Ignoring anything that is not a letter.')).toBeVisible();
  await solve.click();
  await expect(page).toHaveURL('/results?letters=acinort&required=t');
});

test('the first square is the center and repeated letters are flagged', async ({ page }) => {
  await page.goto('/');
  const letters = page.getByRole('textbox', { name: 'Puzzle letters' });
  await expect(page.locator('.sq')).toHaveCount(7);
  await expect(page.locator('.sq.is-center')).toHaveCount(1);
  await letters.fill('cainort');
  await expect(page.locator('.sq.is-center')).toHaveText('c');
  await expect(page.locator('.sq.is-error')).toHaveCount(0);
  await letters.fill('aacnort');
  await expect(page.locator('.sq.is-error')).toHaveCount(1);
  await expect(page.locator('.sq.is-error')).toHaveText('a');
  await expect(page.locator('[data-count]')).toHaveText('7 / 7');
  await letters.fill('cainortx');
  await expect(page.locator('.sq')).toHaveCount(14);
  await expect(page.locator('.sq.is-error')).toHaveCount(1);
});

test('accepts a pasted set and supports a keyboard-only solve', async ({ page }) => {
  await page.goto('/');
  const letters = page.getByRole('textbox', { name: 'Puzzle letters' });
  await letters.focus();
  await page.keyboard.insertText('C AINORT!');
  await expect(letters).toHaveValue('C AINORT!');
  await expect(page.getByText('Ignoring anything that is not a letter.')).toBeVisible();
  await letters.press('Tab');
  const solve = page.getByRole('button', { name: 'Solve' });
  await expect(solve).toBeFocused();
  await solve.press('Enter');
  await expect(page).toHaveURL('/results?letters=acinort&required=c');
});
