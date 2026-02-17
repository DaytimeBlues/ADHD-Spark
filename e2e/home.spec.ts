import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests for Spark ADHD web app (Original Aesthetic).
 */

test.describe('Home Screen', () => {
  test('should load without crash', async ({ page }) => {
    await page.goto('/');

    // App Title
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('should display streak summary', async ({ page }) => {
    await page.goto('/');

    // Current streak format (e.g. STREAK.001)
    await expect(page.getByTestId('home-streak')).toBeVisible();
    await expect(page.getByTestId('home-streak')).toHaveText(/STREAK\.\d{3}/);
  });

  test('should display mode cards', async ({ page }) => {
    await page.goto('/');

    // Current Mode Names
    await expect(page.getByTestId('mode-ignite')).toBeVisible();
    await expect(page.getByTestId('mode-fogcutter')).toBeVisible();
    await expect(page.getByTestId('mode-pomodoro')).toBeVisible();
    await expect(page.getByTestId('mode-anchor')).toBeVisible();
    await expect(page.getByTestId('mode-checkin')).toBeVisible();
    await expect(page.getByTestId('mode-cbtguide')).toBeVisible();
  });

  test('should navigate to Fog Cutter from home card', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('mode-fogcutter').click({ force: true });
    await expect(page.getByText('FOG_CUTTER')).toBeVisible({ timeout: 15000 });
    await expect(page.getByPlaceholder('> INPUT_OVERWHELMING_TASK')).toBeVisible(
      {
        timeout: 15000,
      },
    );
  });

  test('should display bottom tab navigation', async ({ page }) => {
    await page.goto('/');

    // Web nav uses uppercase route labels
    await expect(page.getByText('HOME', { exact: true })).toBeVisible();
    await expect(page.getByText('FOCUS', { exact: true })).toBeVisible();
    await expect(page.getByText('TASKS', { exact: true })).toBeVisible();
    await expect(page.getByText('CALENDAR', { exact: true })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.skip('should navigate to Focus tab', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Focus');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=5-Minute Focus Timer')).toBeVisible({
      timeout: 5000,
    });
  });
});
