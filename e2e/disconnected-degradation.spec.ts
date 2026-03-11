import { test, expect } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

test.describe('Disconnected Degradation (Non-PWA)', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
  });

  test('chat API failure degrades gracefully while local tools keep working without claiming offline/PWA support', async ({
    page,
  }) => {
    await page.route('**/api/chat', async (route) => route.abort('failed'));

    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();

    await page.getByTestId('nav-focus').click({ force: true });
    await page.getByText('CHAT', { exact: true }).click({ force: true });
    await page.getByPlaceholder('TYPE_YOUR_THOUGHTS...').fill('offline check');
    await page.getByText('SEND', { exact: true }).click();

    await expect(page.getByText('offline check')).toBeVisible();
    await expect(page.getByPlaceholder('TYPE_YOUR_THOUGHTS...')).toBeVisible();

    await page.getByTestId('nav-tasks').click({ force: true });
    await expect(page.getByText('NEBULA QUEUE')).toBeVisible();
    await page.getByTestId('open-brain-dump').click();
    await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
    await page
      .getByPlaceholder('> INPUT_DATA...')
      .fill('Local storage still works');
    await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
    await expect(page.getByText('Local storage still works')).toBeVisible();

    await page.getByTestId('nav-home').click({ force: true });
    await page.getByTestId('mode-pomodoro').click({ force: true });
    await expect(page.getByTestId('timer-display')).toBeVisible();
  });
});
