/**
 * Takes the README screenshots for every app from its production build, so they
 * show what ships. Build first, then run `pnpm screenshots` from the repo root.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from '@playwright/test';

interface Shot {
  file: string;
  path: string;
  /** Capture the whole page rather than the first screen; only for pages a little taller than it. */
  fullPage?: boolean;
  /** Resolves once the page shows what the screenshot is for. */
  ready: (page: Page) => Promise<unknown>;
}

interface App {
  name: string;
  port: number;
  shots: Shot[];
}

const APPS: App[] = [
  {
    name: 'raga-man',
    port: 4521,
    shots: [
      { file: 'screenshot-home.png', path: '/', ready: (page) => page.locator('#letters').waitFor() },
      {
        file: 'screenshot-results.png',
        path: '/results?letters=elpsta',
        fullPage: true,
        ready: (page) => page.locator('#exact-section li').first().waitFor(),
      },
    ],
  },
  {
    name: 'letter-garden',
    port: 4522,
    shots: [
      { file: 'screenshot-home.png', path: '/', ready: (page) => page.locator('main form').first().waitFor() },
      {
        file: 'screenshot-results.png',
        path: '/results?letters=acinort&required=c',
        ready: (page) => page.locator('#results-content > *').first().waitFor(),
      },
    ],
  },
];

const root = fileURLToPath(new URL('../../../', import.meta.url));

async function serve(app: App): Promise<ChildProcess> {
  const dir = `${root}apps/${app.name}`;
  if (!existsSync(`${dir}/dist`)) throw new Error(`${app.name} has no build; run pnpm build first`);
  const server = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(app.port), '--ignore-lock'], {
    cwd: dir,
    stdio: 'ignore',
  });
  for (let tries = 0; tries < 100; tries++) {
    try {
      if ((await fetch(`http://localhost:${app.port}/`)).ok) return server;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  server.kill();
  throw new Error(`${app.name} preview did not start on port ${app.port}`);
}

const browser = await chromium.launch();
try {
  for (const app of APPS) {
    const server = await serve(app);
    try {
      // An iPhone-sized viewport at 2x, light theme: the apps are phone first.
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        colorScheme: 'light',
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      const out = `${root}apps/${app.name}/docs`;
      mkdirSync(out, { recursive: true });
      for (const shot of app.shots) {
        await page.goto(`http://localhost:${app.port}${shot.path}`);
        await shot.ready(page);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `${out}/${shot.file}`, fullPage: shot.fullPage, animations: 'disabled', caret: 'hide' });
        console.log(`apps/${app.name}/docs/${shot.file}`);
      }
      await context.close();
    } finally {
      server.kill();
    }
  }
} finally {
  await browser.close();
}
