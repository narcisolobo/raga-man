import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  webServer: {
    command: 'pnpm exec astro preview --port 4321 --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
  use: { baseURL: 'http://localhost:4321' },
  projects: [{ name: 'phone', use: { ...devices['Pixel 7'] } }],
});
