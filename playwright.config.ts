import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for ADHD-CADDI comprehensive E2E testing.
 * Multi-browser, multi-viewport, edge-case coverage.
 * @see https://playwright.dev/docs/test-configuration
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'playwright-junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Capture console logs and page errors
    launchOptions: {
      logger: {
        isEnabled: () => true,
        log: (name, severity, message) => {
          if (severity === 'error' || severity === 'warning') {
            process.stdout.write(
              `[BROWSER ${severity.toUpperCase()}] ${name}: ${message}\n`,
            );
          }
        },
      },
    },
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },

    // Production build testing
    {
      name: 'chromium-prod',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*\.prod\.spec\.ts/,
    },
  ],

  /* Run local dev server before starting tests (only for non-prod tests) */
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
      command: 'npm run web',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 600 * 1000,
    },
});
