import { test, expect } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
    await page.getByTestId('nav-focus').click({ force: true });
    await page.getByText('CHAT', { exact: true }).click({ force: true });
    await expect(page.getByText('SPARK_ASSISTANT')).toBeVisible();
  });

  test('send a message and show assistant response', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reply: 'Mocked assistant response' }),
      });
    });

    await page.getByPlaceholder('TYPE_YOUR_THOUGHTS...').fill('hello');
    await page.getByText('SEND', { exact: true }).click();

    await expect(page.getByText('hello')).toBeVisible();
    await expect(page.getByText('Mocked assistant response')).toBeVisible();
  });

  test('remains usable when chat API fails', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'server error' }),
      });
    });

    await page.getByPlaceholder('TYPE_YOUR_THOUGHTS...').fill('will fail');
    await page.getByText('SEND', { exact: true }).click();

    await expect(page.getByText('will fail')).toBeVisible();
    await expect(page.getByPlaceholder('TYPE_YOUR_THOUGHTS...')).toBeVisible();
  });
});
