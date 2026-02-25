import { test, expect } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

test.describe('BrainDump Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/'); // Second goto to ensure init scripts applied and storage clean
    await expect(page.getByTestId('home-title')).toBeVisible();
    await page.getByTestId('nav-tasks').click({ force: true });
    await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
  });

  test('add item then delete item', async ({ page }) => {
    await page
      .getByPlaceholder('> INPUT_DATA...')
      .fill('Playwright brain dump item');
    await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
    await expect(page.getByText('Playwright brain dump item')).toBeVisible();

    // Dismiss guide if it appears (first item added)
    const ackButton = page.getByText('ACK');
    if (await ackButton.isVisible()) {
      await ackButton.click();
      await page.waitForTimeout(200); // Wait for item layout to stabilize after banner removal
    }

    await page
      .getByTestId('delete-item-button')
      .first()
      .click({ force: true });
    await expect(
      page.getByText('Playwright brain dump item'),
    ).not.toBeVisible();
  });

  test('items persist across reload', async ({ page }) => {
    await page.getByPlaceholder('> INPUT_DATA...').fill('Persistence item');
    await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
    await expect(page.getByText('Persistence item')).toBeVisible();
    await page.waitForTimeout(450);

    await page.reload();
    await page.getByTestId('nav-tasks').click({ force: true });
    await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
    await expect(page.getByText('Persistence item')).toBeVisible();
  });
});
