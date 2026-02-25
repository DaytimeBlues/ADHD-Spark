import { test, expect } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

test.describe('CheckIn Flow', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
    await page.getByTestId('mode-checkin').click({ force: true });
    await expect(
      page.getByText('HOW ARE YOU FEELING RIGHT NOW?'),
    ).toBeVisible();
  });

  test('select mood + energy and show recommendation', async ({ page }) => {
    await page.getByTestId('mood-option-4').click({ force: true });
    await page.getByTestId('energy-option-2').click({ force: true });

    await expect(page.getByText('RECOMMENDED FOR YOU')).toBeVisible();
    await expect(
      page.getByTestId('recommendation-action-button'),
    ).toBeVisible();
  });

  test('check-in flow remains usable after reload', async ({ page }) => {
    await page.getByTestId('mood-option-3').click({ force: true });
    await page.getByTestId('energy-option-3').click({ force: true });
    await expect(page.getByText('RECOMMENDED FOR YOU')).toBeVisible();

    await page.reload();
    await page.getByTestId('mode-checkin').click({ force: true });
    await expect(
      page.getByText('HOW ARE YOU FEELING RIGHT NOW?'),
    ).toBeVisible();
    await page.getByTestId('mood-option-2').click({ force: true });
    await page.getByTestId('energy-option-2').click({ force: true });
    await expect(page.getByText('RECOMMENDED FOR YOU')).toBeVisible();
  });
});
