import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e', // Folder for your tests
  timeout: 30 * 1000, // 30 seconds per test
  retries: 1, // Retry once on failure
  use: {
    headless: true, // Run tests without UI; set false to see browser
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10 * 1000,
    ignoreHTTPSErrors: true,
    video: 'on-first-retry', // Record video on first retry
  },
  webServer: {
    command: 'bun dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
