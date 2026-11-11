import { test, expect } from '@playwright/test';

for (const path of ['/', '/results?letters=acinort&required=c']) {
  test(`the footer points to the rest of the suite (${path})`, async ({ page }) => {
    await page.goto(path);
    const link = page.locator('footer.foot').getByRole('link', { name: 'solversuite.app' });
    await expect(link).toHaveAttribute('href', 'https://solversuite.app/');
    await expect(page.locator('footer.foot p').last()).toHaveText(/Debian wamerican \(SCOWL\)\. More solvers at solversuite\.app\.$/);
    // It shares the credit line rather than adding one.
    await expect(page.locator('footer.foot p')).toHaveCount(2);
  });
}
