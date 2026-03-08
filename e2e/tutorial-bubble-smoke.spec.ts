import { expect, test } from '@playwright/test';
import { enableCosmicTheme, enableE2ETestMode } from './helpers/seed';

test.describe('Tutorial And Bubble Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('brain dump tutorial auto-starts and can be replayed', async ({
    page,
  }) => {
    await page.getByTestId('nav-tasks').click({ force: true });
    await expect(page.getByText('BRAIN_DUMP')).toBeVisible();

    await expect(page.getByTestId('tutorial-overlay')).toBeVisible();
    await expect(page.getByText('Brain Dump: Clear the Noise')).toBeVisible();

    await page.getByTestId('tutorial-next-button').click();
    await expect(page.getByText('Capture Everything')).toBeVisible();

    await page.getByTestId('tutorial-skip-button').click();
    await expect(page.getByTestId('tutorial-overlay')).not.toBeVisible();

    await page.getByTestId('brain-dump-tour-button').click();
    await expect(page.getByTestId('tutorial-overlay')).toBeVisible();
    await expect(page.getByText('Brain Dump: Clear the Noise')).toBeVisible();
  });

  test('capture bubble saves a text note and routes into inbox', async ({
    page,
  }) => {
    await expect(page.getByTestId('capture-bubble')).toBeVisible();
    await page.getByTestId('capture-bubble').click();

    await expect(page.getByTestId('capture-drawer')).toBeVisible();
    await page.getByTestId('capture-mode-text').click();

    await page
      .getByTestId('capture-text-input')
      .fill('Playwright bubble smoke note');
    await page.getByRole('button', { name: 'SAVE TO INBOX' }).click();

    await expect(page.getByTestId('capture-drawer')).not.toBeVisible();
    await expect(page.getByTestId('capture-bubble-badge')).toBeVisible();

    await page.getByTestId('capture-bubble-badge').click();
    await expect(page.getByTestId('inbox-screen')).toBeVisible();
    await expect(page.getByText('Playwright bubble smoke note')).toBeVisible();
  });
});
