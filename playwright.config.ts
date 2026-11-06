import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  webServer: {
    command: 'pnpm astro preview --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
  use: { baseURL: 'http://localhost:4321' },
  projects: [{ name: 'phone', use: { ...devices['Pixel 7'] } }],
});
