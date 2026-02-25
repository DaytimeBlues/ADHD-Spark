import { test, expect } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

test.describe('BrainDump Flow', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
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

    await page
      .getByLabel('Delete brain dump item')
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
