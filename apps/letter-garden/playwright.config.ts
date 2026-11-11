import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  // Its own port (dev uses 4322), and never reuse: a reused server may be the
  // dev server or a stale preview rather than the build under test.
  webServer: {
    command: 'pnpm exec astro preview --port 4422 --ignore-lock',
    url: 'http://localhost:4422',
    reuseExistingServer: false,
  },
  use: { baseURL: 'http://localhost:4422' },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
