import { test, expect } from '@playwright/test';

const exactWords = (page: import('@playwright/test').Page) =>
  page.locator('#exact-section li').allTextContents();

test('the input itself is hidden from the anagrams', async ({ page }) => {
  await page.goto('/results?letters=listen');
  await expect(page.locator('#exact-section h2')).toHaveText('Anagrams');
  const words = await exactWords(page);
  expect(words).toContain('silent');
  expect(words).not.toContain('listen');
  await expect(page.locator('#exact-section .group-count')).toHaveText(`${words.length} words`);
  await expect(page.locator('#partials-button')).toBeVisible();
});

test('a word with no other anagrams opens partials automatically', async ({ page }) => {
  await page.goto('/results?letters=firework');
  await expect(page.locator('#exact-section h2')).toHaveText('No anagrams');
  await expect(page.locator('#exact-section li')).toHaveCount(0);
  await expect(page.locator('#partials-section h3').first()).toBeVisible();
  await expect(page.locator('#partials-button')).toBeHidden();
});

test('the exact section leaves no dead space beneath its content', async ({ page }) => {
  for (const letters of ['firework', 'ab', 'cartep', 'listen']) {
    await page.goto(`/results?letters=${letters}`);
    await expect(page.locator('#exact-section h2')).toBeVisible();
    // The section must end where its last child ends: no room reserved after loading.
    const gap = await page.locator('#exact-section').evaluate((section) => {
      const last = section.lastElementChild!.getBoundingClientRect();
      return section.getBoundingClientRect().bottom - last.bottom;
    });
    expect(gap).toBeLessThan(4);
  }
});

test('a too-short input says why there is nothing, instead of two bare "no" lines', async ({ page }) => {
  for (const letters of ['a', 'ab', 'abc']) {
    await page.goto(`/results?letters=${letters}`);
    await expect(page.locator('#exact-section h2')).toHaveText('No anagrams');
    await expect(page.locator('#exact-section')).toContainText('Words need at least four letters.');
    await expect(page.locator('#partials-section')).toContainText('No partial anagrams');
  }
});

test('longer inputs do not show the too-short note', async ({ page }) => {
  await page.goto('/results?letters=tcaorpe');
  await expect(page.locator('#exact-section h2')).toHaveText('No anagrams');
  await expect(page.locator('#exact-section')).not.toContainText('at least four letters');
});

test('the results page ends with the same footer note as home', async ({ page }) => {
  await page.goto('/');
  const home = await page.locator('footer.foot').textContent();
  await page.goto('/results?letters=cartep');
  await expect(page.locator('footer.foot')).toHaveText(home!.trim());
  await expect(page.locator('footer.foot')).toContainText('Words of four letters or more. No names, no possessives.');
});

test('a non-word keeps the plain exact heading', async ({ page }) => {
  await page.goto('/results?letters=cartep');
  await expect(page.locator('#exact-section h2')).toHaveText('Anagrams');
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
  await expect(page.locator('#partials-status')).toHaveText(/^\d+ partial anagrams in \d+ groups\.$/);
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

test('the no-partials note is separated from the anagrams section above it', async ({ page }) => {
  await page.goto('/results?letters=ab');
  // Measure only once everything has loaded: while loading, the anagrams section
  // reserves extra height, which would make the gap look too small.
  await expect(page.locator('#exact-section')).not.toHaveClass(/is-loading/);
  const note = await page.locator('#partials-section .empty-note').boundingBox();
  const exact = await page.locator('#exact-section').boundingBox();
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
  await expect(page.locator('#exact-section h2')).toHaveText('Anagrams');
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

test.describe('footer position', () => {
  const footerGap = async (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const foot = document.querySelector('footer.foot')!.getBoundingClientRect();
      return { bottom: foot.bottom, viewport: window.innerHeight, docHeight: document.documentElement.scrollHeight, top: foot.top };
    });

  test('sits at the bottom of the viewport on a short results page', async ({ page }) => {
    await page.goto('/results?letters=ab');
    await expect(page.locator('#exact-section h2')).toBeVisible();
    const { bottom, viewport, docHeight } = await footerGap(page);
    // The page's own 2rem bottom padding is all that remains beneath it, and nothing scrolls.
    expect(viewport - bottom).toBeLessThanOrEqual(34);
    expect(viewport - bottom).toBeGreaterThanOrEqual(30);
    expect(docHeight).toBeLessThanOrEqual(viewport);
  });

  test('sits at the bottom of the viewport on the home page', async ({ page }) => {
    await page.goto('/');
    const { bottom, viewport, docHeight } = await footerGap(page);
    expect(viewport - bottom).toBeLessThanOrEqual(34);
    expect(docHeight).toBeLessThanOrEqual(viewport);
  });

  test('follows the content on a long page instead of overlapping it', async ({ page }) => {
    await page.goto('/results?letters=elgnarts');
    await page.click('#partials-button');
    const lastGroup = page.locator('#partials-section .group').last();
    await expect(lastGroup).toBeVisible();
    const groupBottom = (await lastGroup.boundingBox())!.y + (await lastGroup.boundingBox())!.height;
    const { top, bottom, docHeight } = await footerGap(page);
    expect(top).toBeGreaterThanOrEqual(groupBottom + 36);
    expect(docHeight - bottom).toBeLessThanOrEqual(34);
  });

  test('stays at the bottom of a tall desktop window too', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/results?letters=ab');
    await expect(page.locator('#exact-section h2')).toBeVisible();
    const { bottom, viewport } = await footerGap(page);
    expect(viewport - bottom).toBeLessThanOrEqual(34);
  });
});
