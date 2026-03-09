import { test, expect, Page } from '@playwright/test';
import { enableCosmicTheme, enableE2ETestMode } from './helpers/seed';
import { gotoAppRoot } from './helpers/navigation';

const goToTasks = async (page: Page) => {
  await gotoAppRoot(page);
  await expect(page.getByTestId('nav-tasks')).toBeVisible();
  await page.getByTestId('nav-tasks').click({ force: true });
  await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
};

test.describe('OAuth Integration Panel', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
  });

  test('shows integration controls in Tasks', async ({ page }) => {
    await goToTasks(page);

    const panel = page.getByTestId('integrations-panel');
    await expect(panel).toBeVisible();
    await expect(panel.getByTestId('google-connect-btn')).toBeVisible();
    await expect(panel.getByTestId('todoist-connect-btn')).toBeVisible();
    await expect(panel.getByText('Not connected')).toHaveCount(2);
  });

  test('renders metadata-only Google and Todoist state on web', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'googleAuth',
        JSON.stringify({
          connected: true,
          email: 'teacher@example.com',
          expiresAt: Date.now() + 60 * 60 * 1000,
        }),
      );
      localStorage.setItem(
        'todoistAuth',
        JSON.stringify({
          connected: true,
          email: 'teacher+todoist@example.com',
          name: 'Teacher Todoist',
        }),
      );
    });

    await goToTasks(page);

    await expect(page.getByText('teacher@example.com')).toBeVisible();
    await expect(page.getByText('teacher+todoist@example.com')).toBeVisible();
    await expect(page.getByTestId('google-disconnect-btn')).toBeVisible();
    await expect(page.getByTestId('todoist-disconnect-btn')).toBeVisible();
    await expect(page.getByTestId('google-status-connected')).toBeVisible();
    await expect(page.getByTestId('todoist-status-connected')).toBeVisible();
  });
});
