import { test, expect, Page } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

/**
 * OAuth and Todoist Integration Tests
 * These tests will FAIL until the integrations are implemented
 * This is intentional - test-first development approach
 */

const goToTab = async (
  page: Page,
  tab: 'home' | 'focus' | 'tasks' | 'calendar' | 'chat',
) => {
  const tabButton = page.getByTestId(`nav-${tab}`);
  await expect(tabButton).toBeVisible();
  await tabButton.click({ force: true });
};

test.describe('Google OAuth Integration', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('Google connect button visible in Tasks screen', async ({ page }) => {
    await goToTab(page, 'tasks');
    await expect(page.getByText('BRAIN_DUMP')).toBeVisible();

    // This will FAIL until implemented
    const googleConnectBtn = page.getByTestId('google-connect-btn');
    await expect(googleConnectBtn).toBeVisible();
  });

  test('Google OAuth flow initiates on click', async ({ page }) => {
    await goToTab(page, 'tasks');

    const googleConnectBtn = page.getByTestId('google-connect-btn');
    await expect(googleConnectBtn).toBeVisible();

    await googleConnectBtn.click();

    // Should open OAuth popup or redirect
    // This will FAIL until implemented
    await expect(page.getByText(/Google|Sign in|Authorize/i)).toBeVisible();
  });

  test('Google connection shows user email after success', async ({ page }) => {
    // Mock successful OAuth
    await page.addInitScript(() => {
      localStorage.setItem(
        'googleAuth',
        JSON.stringify({
          connected: true,
          email: 'test@example.com',
          expiresAt: Date.now() + 3600000,
        }),
      );
    });

    await goToTab(page, 'tasks');

    // Should show connected state
    // This will FAIL until implemented
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByTestId('google-disconnect-btn')).toBeVisible();
  });

  test('Google disconnect removes connection', async ({ page }) => {
    // Mock connected state
    await page.addInitScript(() => {
      localStorage.setItem(
        'googleAuth',
        JSON.stringify({
          connected: true,
          email: 'test@example.com',
          expiresAt: Date.now() + 3600000,
        }),
      );
    });

    await goToTab(page, 'tasks');

    const disconnectBtn = page.getByTestId('google-disconnect-btn');
    await expect(disconnectBtn).toBeVisible();

    await disconnectBtn.click();

    // Should show connect button again
    // This will FAIL until implemented
    await expect(page.getByTestId('google-connect-btn')).toBeVisible();
  });

  test('Google OAuth handles denial gracefully', async ({ page }) => {
    await goToTab(page, 'tasks');

    const googleConnectBtn = page.getByTestId('google-connect-btn');
    await googleConnectBtn.click();

    // Simulate OAuth denial
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('oauth-error', {
          detail: { error: 'access_denied' },
        }),
      );
    });

    // Should show error message but not crash
    // This will FAIL until implemented
    await expect(page.getByText(/denied|cancelled|error/i)).toBeVisible();
    await expect(page.getByTestId('google-connect-btn')).toBeVisible();
  });

  test('Google OAuth handles network error', async ({ page }) => {
    await page.route('**/oauth/**', async (route) => route.abort('failed'));

    await goToTab(page, 'tasks');

    const googleConnectBtn = page.getByTestId('google-connect-btn');
    await googleConnectBtn.click();

    // Should show network error
    // This will FAIL until implemented
    await expect(page.getByText(/network|connection|offline/i)).toBeVisible();
  });

  test('Google token refresh on expiry', async ({ page }) => {
    // Mock expired token
    await page.addInitScript(() => {
      localStorage.setItem(
        'googleAuth',
        JSON.stringify({
          connected: true,
          email: 'test@example.com',
          expiresAt: Date.now() - 1000, // Expired
          refreshToken: 'mock-refresh-token',
        }),
      );
    });

    await goToTab(page, 'tasks');

    // Should auto-refresh or prompt re-auth
    // This will FAIL until implemented
    await expect(page.getByText(/reconnect|refresh|expired/i)).toBeVisible();
  });
});

test.describe('Todoist Integration', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('Todoist connect button visible in Tasks screen', async ({ page }) => {
    await goToTab(page, 'tasks');

    // This will FAIL until implemented
    const todoistConnectBtn = page.getByTestId('todoist-connect-btn');
    await expect(todoistConnectBtn).toBeVisible();
  });

  test('Todoist OAuth flow initiates on click', async ({ page }) => {
    await goToTab(page, 'tasks');

    const todoistConnectBtn = page.getByTestId('todoist-connect-btn');
    await expect(todoistConnectBtn).toBeVisible();

    await todoistConnectBtn.click();

    // Should open Todoist OAuth
    // This will FAIL until implemented
    await expect(page.getByText(/Todoist|Authorize|Connect/i)).toBeVisible();
  });

  test('Todoist project selection after connection', async ({ page }) => {
    // Mock connected state
    await page.addInitScript(() => {
      localStorage.setItem(
        'todoistAuth',
        JSON.stringify({
          connected: true,
          token: 'mock-token',
        }),
      );
    });

    await goToTab(page, 'tasks');

    // Should show project selector
    // This will FAIL until implemented
    await expect(page.getByTestId('todoist-project-select')).toBeVisible();
  });

  test('Sync tasks to Todoist', async ({ page }) => {
    // Mock connected state
    await page.addInitScript(() => {
      localStorage.setItem(
        'todoistAuth',
        JSON.stringify({
          connected: true,
          token: 'mock-token',
          selectedProject: 'Inbox',
        }),
      );
    });

    await goToTab(page, 'tasks');

    // Add a task
    await page
      .getByPlaceholder('> INPUT_DATA...')
      .fill('Task to sync to Todoist');
    await page.getByPlaceholder('> INPUT_DATA...').press('Enter');

    // Should have sync button
    // This will FAIL until implemented
    const syncBtn = page.getByTestId('todoist-sync-btn');
    await expect(syncBtn).toBeVisible();

    await syncBtn.click();

    // Should show success
    // This will FAIL until implemented
    await expect(page.getByText(/synced|success|✓/i)).toBeVisible();
  });

  test('Todoist sync status indicator', async ({ page }) => {
    // Mock connected with sync state
    await page.addInitScript(() => {
      localStorage.setItem(
        'todoistAuth',
        JSON.stringify({
          connected: true,
          token: 'mock-token',
          lastSync: Date.now(),
        }),
      );
    });

    await goToTab(page, 'tasks');

    // Should show last sync time
    // This will FAIL until implemented
    await expect(page.getByTestId('todoist-sync-status')).toBeVisible();
    await expect(page.getByText(/synced|last sync/i)).toBeVisible();
  });

  test('Todoist handles API errors gracefully', async ({ page }) => {
    await page.route('**/todoist/**', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
      });
    });

    // Mock connected state
    await page.addInitScript(() => {
      localStorage.setItem(
        'todoistAuth',
        JSON.stringify({
          connected: true,
          token: 'invalid-token',
        }),
      );
    });

    await goToTab(page, 'tasks');

    const syncBtn = page.getByTestId('todoist-sync-btn');
    if (await syncBtn.isVisible().catch(() => false)) {
      await syncBtn.click();

      // Should show error
      // This will FAIL until implemented
      await expect(page.getByText(/error|failed|unauthorized/i)).toBeVisible();
    }
  });

  test('Todoist disconnect removes connection', async ({ page }) => {
    // Mock connected state
    await page.addInitScript(() => {
      localStorage.setItem(
        'todoistAuth',
        JSON.stringify({
          connected: true,
          token: 'mock-token',
        }),
      );
    });

    await goToTab(page, 'tasks');

    const disconnectBtn = page.getByTestId('todoist-disconnect-btn');
    await expect(disconnectBtn).toBeVisible();

    await disconnectBtn.click();

    // Should show connect button
    // This will FAIL until implemented
    await expect(page.getByTestId('todoist-connect-btn')).toBeVisible();
  });
});

test.describe('Integration Panel UI', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('Integration panel visible in BrainDump', async ({ page }) => {
    await goToTab(page, 'tasks');

    // This will FAIL until implemented
    await expect(page.getByTestId('integrations-panel')).toBeVisible();
  });

  test('Integration panel shows both Google and Todoist', async ({ page }) => {
    await goToTab(page, 'tasks');

    const panel = page.getByTestId('integrations-panel');
    await expect(panel).toBeVisible();

    // This will FAIL until implemented
    await expect(panel.getByText(/Google|Gmail/i)).toBeVisible();
    await expect(panel.getByText(/Todoist/i)).toBeVisible();
  });

  test('Integration status indicators work', async ({ page }) => {
    // Mock both connected
    await page.addInitScript(() => {
      localStorage.setItem(
        'googleAuth',
        JSON.stringify({
          connected: true,
          email: 'test@example.com',
        }),
      );
      localStorage.setItem(
        'todoistAuth',
        JSON.stringify({
          connected: true,
          token: 'mock-token',
        }),
      );
    });

    await goToTab(page, 'tasks');

    // Should show connected indicators
    // This will FAIL until implemented
    await expect(page.getByTestId('google-status-connected')).toBeVisible();
    await expect(page.getByTestId('todoist-status-connected')).toBeVisible();
  });
});
