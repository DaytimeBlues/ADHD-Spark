import { test, expect } from '@playwright/test';

test.describe('Night Awe web runtime', () => {
  test('diagnostics and pomodoro render under Night Awe without getting stuck on the spinner', async ({
    page,
  }) => {
    const hmrErrors: string[] = [];

    page.on('console', (message) => {
      const text = message.text();
      if (
        text.includes('hot-update.json') ||
        text.includes('[HMR] Cannot find update')
      ) {
        hmrErrors.push(text);
      }
    });

    await page.goto('/diagnostics', { timeout: 30000 });

    await expect(page.getByText('DIAGNOSTICS')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('APPEARANCE')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('progressbar')).toHaveCount(0);

    await page.getByLabel('Select Night Awe theme').click({ force: true });

    await page.goto('/pomodoro', { timeout: 30000 });

    await expect(page.getByTestId('timer-display')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId('pomodoro-phase')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('progressbar')).toHaveCount(0);

    await page.waitForTimeout(1500);
    expect(hmrErrors).toEqual([]);
  });
});
