import { expect, test } from '@playwright/test';

test('validates input and retains the required letter through reordering', async ({ page }) => {
  await page.goto('/');
  const letters = page.getByRole('textbox', { name: 'Puzzle letters' });
  const solve = page.getByRole('button', { name: 'Solve' });
  await letters.fill('aacnort');
  await solve.click();
  await expect(page.getByRole('alert').filter({ hasText: 'Use seven different letters.' })).toBeVisible();
  await expect(letters).toBeFocused();
  await letters.fill('TRO NICA!');
  await expect(page.getByText('Only letters A through Z were kept.')).toBeVisible();
  await solve.click();
  await expect(page.getByRole('alert').filter({ hasText: 'Choose one of your seven letters' })).toBeVisible();
  await page.getByRole('radio', { name: 'A', exact: true }).press('ArrowRight');
  const required = page.getByRole('radio', { name: 'C', exact: true });
  await expect(required).toBeChecked();
  await letters.fill('acinort');
  await expect(required).toBeChecked();
  await letters.fill('ainortx');
  await expect(page.locator('input[name=required]:checked')).toHaveCount(0);
  await expect(page).toHaveURL('/');
});

test('waits for composition to finish before updating the selector', async ({ page }) => {
  await page.goto('/');
  const letters = page.getByRole('textbox', { name: 'Puzzle letters' });
  await letters.fill('acinort');
  await page.getByRole('radio', { name: 'C', exact: true }).check();
  await letters.dispatchEvent('compositionstart');
  await letters.fill('ainortx');
  await expect(page.getByRole('radio', { name: 'C', exact: true })).toBeChecked();
  await letters.dispatchEvent('compositionend');
  await expect(page.getByRole('radio', { name: 'X', exact: true })).toBeVisible();
  await expect(letters).toHaveValue('ainortx');
});

test('accepts a pasted set and supports a keyboard-only solve', async ({ page }) => {
  await page.goto('/');
  const letters = page.getByRole('textbox', { name: 'Puzzle letters' });
  await letters.focus();
  await page.keyboard.insertText('TRO NICA!');
  await expect(letters).toHaveValue('TRO NICA!');
  await expect(page.getByText('Only letters A through Z were kept.')).toBeVisible();
  await letters.press('Tab');
  const first = page.getByRole('radio', { name: 'A', exact: true });
  await expect(first).toBeFocused();
  await first.press('ArrowRight');
  const required = page.getByRole('radio', { name: 'C', exact: true });
  await expect(required).toBeFocused();
  await expect(required).toBeChecked();
  await required.press('Tab');
  const solve = page.getByRole('button', { name: 'Solve' });
  await expect(solve).toBeFocused();
  await solve.press('Enter');
  await expect(page).toHaveURL('/results?letters=acinort&required=c');
});
