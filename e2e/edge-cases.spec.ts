import { test, expect, Page } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

/**
 * Edge Case and Error Handling Tests
 * Tests offline mode, API failures, storage corruption, etc.
 */

const goToTab = async (
  page: Page,
  tab: 'home' | 'focus' | 'tasks' | 'calendar' | 'chat',
) => {
  const tabButton = page.getByTestId(`nav-${tab}`);
  await expect(tabButton).toBeVisible();
  await tabButton.click({ force: true });
};

test.describe('Edge Cases and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test.describe('Offline Mode', () => {
    test('app works offline - local features functional', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true);

      // Navigate to tasks
      await goToTab(page, 'tasks');
      await expect(page.getByText('BRAIN_DUMP')).toBeVisible();

      // Add item offline
      await page.getByPlaceholder('> INPUT_DATA...').fill('Offline task');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
      await expect(page.getByText('Offline task')).toBeVisible();

      // Timer should work offline
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await expect(page.getByTestId('timer-display')).toBeVisible();
      await page.getByText(/START TIMER/i).click();
      await expect(page.getByText(/PAUSE/i)).toBeVisible();

      // Go back online
      await page.context().setOffline(false);
    });

    test('chat degrades gracefully when offline', async ({ page }) => {
      await page.route('**/api/chat', async (route) => route.abort('failed'));

      await goToTab(page, 'chat');
      await expect(page.getByText('CADDI_ASSISTANT')).toBeVisible();

      const input = page.getByPlaceholder(/TYPE_YOUR_THOUGHTS/i);
      await input.fill('Offline message');
      await page.getByText(/SEND/i).click();

      // Message should still appear locally
      await expect(page.getByText('Offline message')).toBeVisible();
      // Input should remain functional
      await expect(input).toBeVisible();
    });
  });

  test.describe('API Error Handling', () => {
    test('handles 429 rate limit', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 429,
          body: JSON.stringify({ error: 'Rate limit exceeded' }),
        });
      });

      await goToTab(page, 'tasks');
      await page.getByPlaceholder('> INPUT_DATA...').fill('Test item');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');

      // App should not crash
      await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
    });

    test('handles 500 server error', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await goToTab(page, 'chat');
      const input = page.getByPlaceholder(/TYPE_YOUR_THOUGHTS/i);
      await input.fill('Test');
      await page.getByText(/SEND/i).click();

      // App should show error or retry option
      await expect(page.getByText('CADDI_ASSISTANT')).toBeVisible();
    });

    test('handles API timeout', async ({ page }) => {
      await page.route('**/api/**', async (_route) => {
        // Never respond - simulate timeout
        await new Promise(() => {});
      });

      await goToTab(page, 'chat');
      const input = page.getByPlaceholder(/TYPE_YOUR_THOUGHTS/i);
      await input.fill('Timeout test');
      await page.getByText(/SEND/i).click();

      // Wait for timeout handling
      await page.waitForTimeout(5000);

      // App should still be functional
      await expect(page.getByText('CADDI_ASSISTANT')).toBeVisible();
    });

    test('handles network interruption mid-request', async ({ page }) => {
      let requestCount = 0;
      await page.route('**/api/**', async (route) => {
        requestCount++;
        if (requestCount === 1) {
          await route.abort('failed');
        } else {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ reply: 'Success after retry' }),
          });
        }
      });

      await goToTab(page, 'chat');
      const input = page.getByPlaceholder(/TYPE_YOUR_THOUGHTS/i);
      await input.fill('Retry test');
      await page.getByText(/SEND/i).click();

      // Should handle gracefully
      await expect(page.getByText('CADDI_ASSISTANT')).toBeVisible();
    });
  });

  test.describe('Storage Corruption and Recovery', () => {
    test('recovers from corrupted localStorage', async ({ page }) => {
      // Corrupt the storage
      await page.evaluate(() => {
        localStorage.setItem('brainDump', 'not-valid-json{');
        localStorage.setItem('tasks', 'undefined');
      });

      // Reload and verify app still works
      await page.reload();
      await expect(page.getByTestId('home-title')).toBeVisible();

      // Navigate to tasks - should handle gracefully
      await goToTab(page, 'tasks');
      await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
    });

    test('handles localStorage quota exceeded', async ({ page }) => {
      // Try to fill storage
      await page.evaluate(() => {
        try {
          const largeData = 'x'.repeat(1024 * 1024); // 1MB string
          for (let i = 0; i < 10; i++) {
            localStorage.setItem(`large-item-${i}`, largeData);
          }
        } catch (e) {
          // Expected to fail
        }
      });

      // App should still function
      await page.getByTestId('mode-fogcutter').click({ force: true });
      await expect(page.getByText('FOG_CUTTER')).toBeVisible();
    });

    test('handles private browsing mode (no localStorage)', async ({
      page,
    }) => {
      // Simulate by clearing all storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.reload();
      await expect(page.getByTestId('home-title')).toBeVisible();

      // Should be able to use app without storage
      await goToTab(page, 'tasks');
      await page.getByPlaceholder('> INPUT_DATA...').fill('No storage test');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
    });
  });

  test.describe('Rapid Interactions', () => {
    test('handles rapid tab switching', async ({ page }) => {
      const tabs: Array<'home' | 'focus' | 'tasks' | 'calendar'> = [
        'home',
        'focus',
        'tasks',
        'calendar',
      ];

      for (let i = 0; i < 10; i++) {
        const tab = tabs[i % tabs.length];
        await goToTab(page, tab);
      }

      // App should still be stable
      await expect(page.getByTestId('home-title')).toBeVisible();
    });

    test('handles rapid button clicks', async ({ page }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });

      // Rapid start/stop
      for (let i = 0; i < 5; i++) {
        await page.getByText(/START TIMER|PAUSE|RESUME/i).click();
      }

      // Timer should still be functional
      await expect(page.getByTestId('timer-display')).toBeVisible();
    });

    test('handles rapid item additions', async ({ page }) => {
      await goToTab(page, 'tasks');

      // Add 10 items rapidly
      for (let i = 0; i < 10; i++) {
        await page.getByPlaceholder('> INPUT_DATA...').fill(`Rapid item ${i}`);
        await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
      }

      // All items should be visible
      for (let i = 0; i < 10; i++) {
        await expect(page.getByText(`Rapid item ${i}`)).toBeVisible();
      }
    });
  });

  test.describe('Background/Foreground Transitions', () => {
    test('timer continues after tab backgrounded', async ({ page }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await page.getByText(/START TIMER/i).click();

      const timer = page.getByTestId('timer-display');
      const beforeBackground = await timer.textContent();

      // Open new tab to background this one
      const newPage = await page.context().newPage();
      await newPage.goto('about:blank');

      await page.waitForTimeout(2000);
      await page.bringToFront();
      await newPage.close();

      const afterBackground = await timer.textContent();
      expect(afterBackground).not.toBe(beforeBackground);
    });

    test('state persists after page reload', async ({ page }) => {
      await goToTab(page, 'tasks');
      await page.getByPlaceholder('> INPUT_DATA...').fill('Persistence test');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
      await expect(page.getByText('Persistence test')).toBeVisible();

      await page.reload();
      await goToTab(page, 'tasks');
      await expect(page.getByText('Persistence test')).toBeVisible();
    });
  });

  test.describe('Slow Network Simulation', () => {
    test('app usable on slow 3G', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async (route) => {
        await new Promise((r) => setTimeout(r, 500)); // 500ms delay
        await route.continue();
      });

      await page.goto('/');
      await expect(page.getByTestId('home-title')).toBeVisible({
        timeout: 30000,
      });

      // Local features should still work
      await goToTab(page, 'tasks');
      await page.getByPlaceholder('> INPUT_DATA...').fill('Slow network test');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
      await expect(page.getByText('Slow network test')).toBeVisible();
    });
  });

  test.describe('Console Error Monitoring', () => {
    test('no critical console errors during normal usage', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      // Perform various actions
      await goToTab(page, 'tasks');
      await page.getByPlaceholder('> INPUT_DATA...').fill('Test');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');

      await goToTab(page, 'focus');
      await page.getByTestId('mode-pomodoro').click({ force: true });

      await goToTab(page, 'home');

      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('source map') &&
          !e.includes('webpack'),
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });
});
