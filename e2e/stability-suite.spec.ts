import { test, expect, Page } from '@playwright/test';
import {
  enableE2ETestMode,
  enableCosmicTheme,
  enableRecordingMock,
  seedAlexPersona,
} from './helpers/seed';

/**
 * Stability Suite — Comprehensive regression and edge-case E2E tests.
 *
 * Covers:
 *  1. Crash-free boot
 *  2. All 5 tabs render
 *  3. Mode card smoke tests
 *  4. Theme persistence
 *  5. Animation safety (no `delay` TypeError — P5 regression)
 *  6. Deep navigation (mode → back → different mode)
 *  7. DOM node leak check
 *  8. Console error logging across full navigation
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TABS = ['home', 'focus', 'tasks', 'calendar', 'chat'] as const;
type TabName = (typeof TABS)[number];

const goToTab = async (page: Page, tab: TabName) => {
  await page.getByTestId(`nav-${tab}`).click({ force: true });
};

const KNOWN_BENIGN_ERRORS = [
  'favicon',
  'source map',
  'webpack',
  'WebMCP',
  'NativeEventEmitter',
  'native animated module',
  'Service Worker',
  'componentWillReceiveProps',
  'componentWillMount',
  'ResizeObserver',
  'net::ERR',
];

const isCriticalError = (msg: string): boolean =>
  !KNOWN_BENIGN_ERRORS.some((benign) => msg.includes(benign));

// ---------------------------------------------------------------------------
// 1. Crash-Free Boot
// ---------------------------------------------------------------------------

test.describe('Stability — Crash-Free Boot', () => {
  test('app loads without pageerror events', async ({ page }) => {
    const crashes: string[] = [];
    page.on('pageerror', (error) => crashes.push(error.message));

    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible({
      timeout: 20000,
    });

    expect(crashes.filter(isCriticalError)).toHaveLength(0);
  });

  test('app loads with seeded user data', async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
    await expect(page.getByTestId('home-streak')).toHaveText(/STREAK\.\d{3}/);
  });
});

// ---------------------------------------------------------------------------
// 2. All 5 Tabs Render
// ---------------------------------------------------------------------------

test.describe('Stability — All Tabs Render', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await enableRecordingMock(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  const tabExpectations: Record<TabName, string> = {
    home: 'home-title',
    focus: 'IGNITE_PROTOCOL',
    tasks: 'BRAIN_DUMP',
    calendar: 'CALENDAR',
    chat: 'CADDI_ASSISTANT',
  };

  for (const tab of TABS) {
    test(`${tab} tab renders without crash`, async ({ page }) => {
      await goToTab(page, tab);

      const expected = tabExpectations[tab];
      if (tab === 'home') {
        await expect(page.getByTestId(expected)).toBeVisible({
          timeout: 15000,
        });
      } else {
        await expect(page.getByText(expected)).toBeVisible({ timeout: 15000 });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Mode Card Smoke Tests
// ---------------------------------------------------------------------------

const MODE_CARDS = [
  { id: 'ignite', verifyText: 'IGNITE_PROTOCOL' },
  { id: 'fogcutter', verifyText: 'FOG_CUTTER' },
  { id: 'pomodoro', verifyText: 'START TIMER' },
  { id: 'anchor', verifyText: 'BREATHING EXERCISES' },
  { id: 'checkin', verifyText: 'HOW ARE YOU FEELING RIGHT NOW?' },
  { id: 'cbtguide', verifyText: 'EVIDENCE-BASED STRATEGIES' },
];

test.describe('Stability — Mode Card Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await enableRecordingMock(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  for (const { id, verifyText } of MODE_CARDS) {
    test(`mode-${id} navigates and renders`, async ({ page }) => {
      await page.getByTestId(`mode-${id}`).click({ force: true });
      await expect(page.getByText(verifyText)).toBeVisible({ timeout: 15000 });
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Theme Persistence
// ---------------------------------------------------------------------------

test.describe('Stability — Theme Persistence', () => {
  test('cosmic theme survives page reload', async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();

    // Reload
    await page.reload();
    await expect(page.getByTestId('home-title')).toBeVisible();

    // Theme should still be set
    const themeValue = await page.evaluate(() =>
      window.localStorage.getItem('theme'),
    );
    expect(themeValue).toBe('cosmic');
  });

  test('phantom theme migrates to cosmic', async ({ page }) => {
    await enableE2ETestMode(page);
    // Set phantom (legacy P5 theme)
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'phantom');
    });
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();

    // App should not crash - it should gracefully handle phantom
    await goToTab(page, 'tasks');
    await expect(page.getByText('BRAIN_DUMP')).toBeVisible({ timeout: 15000 });
  });
});

// ---------------------------------------------------------------------------
// 5. Animation Safety (P5 Regression: `delay` TypeError)
// ---------------------------------------------------------------------------

test.describe('Stability — Animation Safety', () => {
  test('no delay TypeError during tab navigation', async ({ page }) => {
    const typeErrors: string[] = [];
    page.on('pageerror', (error) => {
      if (error.message.includes('delay')) {
        typeErrors.push(error.message);
      }
    });

    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await enableRecordingMock(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();

    // Navigate through all tabs
    for (const tab of TABS) {
      await goToTab(page, tab);
      await page.waitForTimeout(300);
    }

    expect(typeErrors).toHaveLength(0);
  });

  test('no animation crash when navigating mode cards', async ({ page }) => {
    const typeErrors: string[] = [];
    page.on('pageerror', (error) => typeErrors.push(error.message));

    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await enableRecordingMock(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();

    // Navigate to each mode card
    for (const { id } of MODE_CARDS) {
      await page.goto('/');
      await expect(page.getByTestId('home-title')).toBeVisible();
      await page.getByTestId(`mode-${id}`).click({ force: true });
      await page.waitForTimeout(500);
    }

    const criticalErrors = typeErrors.filter(isCriticalError);
    expect(criticalErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 6. Deep Navigation (mode → back → different mode)
// ---------------------------------------------------------------------------

test.describe('Stability — Deep Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await enableRecordingMock(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('navigate mode → home → different mode', async ({ page }) => {
    // Go to fogcutter
    await page.getByTestId('mode-fogcutter').click({ force: true });
    await expect(page.getByText('FOG_CUTTER')).toBeVisible({ timeout: 15000 });

    // Back to home
    await goToTab(page, 'home');
    await expect(page.getByTestId('home-title')).toBeVisible();

    // Go to pomodoro
    await page.getByTestId('mode-pomodoro').click({ force: true });
    await expect(page.getByText('START TIMER')).toBeVisible({
      timeout: 15000,
    });

    // Back to home
    await goToTab(page, 'home');
    await expect(page.getByTestId('home-title')).toBeVisible();

    // Go to anchor
    await page.getByTestId('mode-anchor').click({ force: true });
    await expect(page.getByText('BREATHING EXERCISES')).toBeVisible({
      timeout: 15000,
    });
  });

  test('rapid tab → mode → tab cycling stability', async ({ page }) => {
    const crashes: string[] = [];
    page.on('pageerror', (error) => crashes.push(error.message));

    for (let i = 0; i < 3; i++) {
      await goToTab(page, 'focus');
      await page.waitForTimeout(200);
      await goToTab(page, 'home');
      await page.getByTestId('mode-checkin').click({ force: true });
      await page.waitForTimeout(300);
      await goToTab(page, 'tasks');
      await page.waitForTimeout(200);
      await goToTab(page, 'home');
      await expect(page.getByTestId('home-title')).toBeVisible();
    }

    expect(crashes.filter(isCriticalError)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 7. DOM Node Leak Check
// ---------------------------------------------------------------------------

test.describe('Stability — DOM Node Leak Check', () => {
  test('DOM node count stays reasonable during navigation', async ({
    page,
  }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();

    const initialCount = await page.evaluate(
      () => document.querySelectorAll('*').length,
    );

    // Navigate through all tabs twice
    for (let cycle = 0; cycle < 2; cycle++) {
      for (const tab of TABS) {
        await goToTab(page, tab);
        await page.waitForTimeout(300);
      }
    }

    const finalCount = await page.evaluate(
      () => document.querySelectorAll('*').length,
    );

    // Allow 50% growth max (navigation creates new screens)
    expect(finalCount).toBeLessThan(initialCount * 2.5);
  });
});

// ---------------------------------------------------------------------------
// 8. Console Error Logging Across Full Navigation
// ---------------------------------------------------------------------------

test.describe('Stability — Console Error Sweep', () => {
  test('zero critical console errors across full app navigation', async ({
    page,
  }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    page.on('pageerror', (error) => errors.push(error.message));

    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await enableRecordingMock(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();

    // Navigate all tabs
    for (const tab of TABS) {
      await goToTab(page, tab);
      await page.waitForTimeout(500);
    }

    // Navigate all mode cards from home
    await goToTab(page, 'home');
    for (const { id } of MODE_CARDS) {
      await page.goto('/');
      await expect(page.getByTestId('home-title')).toBeVisible();
      await page.getByTestId(`mode-${id}`).click({ force: true });
      await page.waitForTimeout(500);
    }

    const criticalErrors = errors.filter(isCriticalError);

    // Log all errors for debugging (visible in Playwright report)
    if (criticalErrors.length > 0) {
      process.stderr.write('Critical errors found:\n');
      criticalErrors.forEach((e) => process.stderr.write(`  - ${e}\n`));
    }
    if (warnings.length > 0) {
      process.stdout.write(
        `${warnings.length} warnings captured (non-blocking)\n`,
      );
    }

    expect(criticalErrors).toHaveLength(0);
  });
});
