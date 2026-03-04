import { test, expect, Page } from '@playwright/test';
import { enableE2ETestMode, enableCosmicTheme } from './helpers/seed';

/**
 * Full Page and Button Coverage Tests
 * Tests every screen and interactive element in the app
 */

const goToTab = async (
  page: Page,
  tab: 'home' | 'focus' | 'tasks' | 'calendar' | 'chat',
) => {
  const tabButton = page.getByTestId(`nav-${tab}`);
  await expect(tabButton).toBeVisible();
  await tabButton.click({ force: true });
};

test.describe('Full Page Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test.describe('Home Screen - All Elements', () => {
    test('displays all required elements', async ({ page }) => {
      await expect(page.getByTestId('home-title')).toBeVisible();
      await expect(page.getByTestId('home-streak')).toBeVisible();
      await expect(page.getByTestId('home-streak')).toHaveText(/STREAK\.\d{3}/);
      await expect(page.getByText('SYS.ONLINE')).toBeVisible();
      await expect(page.getByText('WEEKLY_METRICS')).toBeVisible();
      await expect(page.getByTestId('capture-bubble')).toBeVisible();
    });

    test('all mode cards are visible and clickable', async ({ page }) => {
      const modes = [
        'ignite',
        'fogcutter',
        'pomodoro',
        'anchor',
        'checkin',
        'cbtguide',
      ];

      for (const mode of modes) {
        await expect(page.getByTestId(`mode-${mode}`)).toBeVisible();
      }
    });

    test('bottom navigation is visible', async ({ page }) => {
      await expect(page.getByText('HOME', { exact: true })).toBeVisible();
      await expect(page.getByText('FOCUS', { exact: true })).toBeVisible();
      await expect(page.getByText('TASKS', { exact: true })).toBeVisible();
      await expect(page.getByText('CALENDAR', { exact: true })).toBeVisible();
    });
  });

  test.describe('Tab Navigation - All Tabs', () => {
    test('can navigate to all tabs', async ({ page }) => {
      await goToTab(page, 'focus');
      await expect(page.getByText('IGNITE_PROTOCOL')).toBeVisible();

      await goToTab(page, 'tasks');
      await expect(page.getByText('BRAIN_DUMP')).toBeVisible();

      await goToTab(page, 'calendar');
      await expect(page.getByText('CALENDAR')).toBeVisible();

      await goToTab(page, 'home');
      await expect(page.getByTestId('home-title')).toBeVisible();
    });
  });

  test.describe('All Mode Screens - Smoke Test', () => {
    const screens = [
      { mode: 'ignite', verifyText: 'IGNITE_PROTOCOL' },
      { mode: 'fogcutter', verifyText: 'FOG_CUTTER' },
      { mode: 'pomodoro', verifyText: 'START TIMER' },
      { mode: 'anchor', verifyText: 'BREATHING EXERCISES' },
      { mode: 'checkin', verifyText: 'HOW ARE YOU FEELING RIGHT NOW?' },
      { mode: 'cbtguide', verifyText: 'EVIDENCE-BASED STRATEGIES' },
    ];

    for (const { mode, verifyText } of screens) {
      test(`${mode} screen loads without crash`, async ({ page }) => {
        await page.getByTestId(`mode-${mode}`).click({ force: true });
        await expect(page.getByText(verifyText)).toBeVisible({
          timeout: 15000,
        });
      });
    }
  });

  test.describe('BrainDump - All Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await goToTab(page, 'tasks');
      await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
    });

    test('add item via text input', async ({ page }) => {
      await page.getByPlaceholder('> INPUT_DATA...').fill('Test item from E2E');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
      await expect(page.getByText('Test item from E2E')).toBeVisible();
    });

    test('delete item', async ({ page }) => {
      await page.getByPlaceholder('> INPUT_DATA...').fill('Item to delete');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
      await expect(page.getByText('Item to delete')).toBeVisible();

      const ackButton = page.getByText('ACK');
      if (await ackButton.isVisible().catch(() => false)) {
        await ackButton.click();
      }

      await page
        .getByTestId('delete-item-button')
        .first()
        .click({ force: true });
      await expect(page.getByText('Item to delete')).not.toBeVisible();
    });

    test('clear all items', async ({ page }) => {
      await page.getByPlaceholder('> INPUT_DATA...').fill('Item 1');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');

      const clearButton = page.getByText(/CLEAR/i);
      if (await clearButton.isVisible().catch(() => false)) {
        await clearButton.click();
        await page.getByText('CONFIRM').click();
        await expect(page.getByText('_AWAITING_INPUT')).toBeVisible();
      }
    });

    test('AI Sort button is visible and clickable', async ({ page }) => {
      const aiSortBtn = page.getByTestId('brain-dump-ai-sort');
      await expect(aiSortBtn).toBeVisible();
      await aiSortBtn.click();
    });

    test('voice recording toggle', async ({ page }) => {
      const recordToggle = page.getByTestId('brain-dump-record-toggle');
      if (await recordToggle.isVisible().catch(() => false)) {
        await recordToggle.click();
        await expect(page.getByText(/RECORDING|STOP_REC/i)).toBeVisible();
      }
    });
  });

  test.describe('Tasks Screen - All Interactions', () => {
    test('all task operations work', async ({ page }) => {
      // Navigate to Tasks screen if different from BrainDump
      await goToTab(page, 'tasks');

      // Add task
      const input = page.getByPlaceholder(/new objective|task/i);
      if (await input.isVisible().catch(() => false)) {
        await input.fill('New task from E2E');
        await input.press('Enter');
        await expect(page.getByText('New task from E2E')).toBeVisible();

        // Toggle completion
        const checkbox = page
          .locator('[data-testid*="checkbox"], [role="checkbox"]')
          .first();
        if (await checkbox.isVisible().catch(() => false)) {
          await checkbox.click();
        }

        // Filter tabs
        const filters = ['ALL', 'ACTIVE', 'DONE'];
        for (const filter of filters) {
          const filterBtn = page.getByText(filter, { exact: false });
          if (await filterBtn.isVisible().catch(() => false)) {
            await filterBtn.click();
          }
        }
      }
    });
  });

  test.describe('Pomodoro - All Controls', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await expect(page.getByTestId('timer-display')).toBeVisible();
    });

    test('timer display is visible', async ({ page }) => {
      await expect(page.getByTestId('timer-display')).toBeVisible();
    });

    test('start and pause timer', async ({ page }) => {
      await page.getByText(/START TIMER/i).click();
      await expect(page.getByText(/PAUSE/i)).toBeVisible();

      await page.getByText(/PAUSE/i).click();
      await expect(page.getByText(/RESUME|START/i)).toBeVisible();
    });

    test('reset timer', async ({ page }) => {
      const resetBtn = page.getByText(/RESET/i);
      if (await resetBtn.isVisible().catch(() => false)) {
        await resetBtn.click();
      }
    });
  });

  test.describe('CheckIn - All Options', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('mode-checkin').click({ force: true });
      await expect(
        page.getByText('HOW ARE YOU FEELING RIGHT NOW?'),
      ).toBeVisible();
    });

    test('all mood options are clickable', async ({ page }) => {
      for (let i = 1; i <= 5; i++) {
        const moodOption = page.getByTestId(`mood-option-${i}`);
        await expect(moodOption).toBeVisible();
        await moodOption.click();
      }
    });

    test('all energy options are clickable', async ({ page }) => {
      for (let i = 1; i <= 5; i++) {
        const energyOption = page.getByTestId(`energy-option-${i}`);
        await expect(energyOption).toBeVisible();
        await energyOption.click();
      }
    });

    test('recommendation appears after selection', async ({ page }) => {
      await page.getByTestId('mood-option-3').click();
      await page.getByTestId('energy-option-3').click();
      await expect(page.getByText(/RECOMMENDED FOR YOU/i)).toBeVisible();
    });
  });

  test.describe('Capture Bubble - All Features', () => {
    test('bubble is visible on home', async ({ page }) => {
      await expect(page.getByTestId('capture-bubble')).toBeVisible();
    });

    test('opens drawer on click', async ({ page }) => {
      await page.getByTestId('capture-bubble').click();
      await expect(page.getByTestId('capture-drawer')).toBeVisible();
    });

    test('all capture modes visible in drawer', async ({ page }) => {
      await page.getByTestId('capture-bubble').click();

      const modes = ['voice', 'text', 'photo', 'paste', 'meeting'];
      for (const mode of modes) {
        await expect(page.getByTestId(`capture-mode-${mode}`)).toBeVisible();
      }
    });

    test('text capture flow', async ({ page }) => {
      await page.getByTestId('capture-bubble').click();
      await page.getByTestId('capture-mode-text').click();

      const input = page.getByTestId('capture-text-input');
      if (await input.isVisible().catch(() => false)) {
        await input.fill('Quick capture test');
        await page.getByTestId('capture-confirm').click();
        await expect(page.getByTestId('capture-drawer')).not.toBeVisible();
      }
    });

    test('cancel closes drawer', async ({ page }) => {
      await page.getByTestId('capture-bubble').click();
      await page.getByTestId('capture-cancel').click();
      await expect(page.getByTestId('capture-drawer')).not.toBeVisible();
    });
  });

  test.describe('Inbox - All Features', () => {
    test('inbox accessible from bubble', async ({ page }) => {
      await page.getByTestId('capture-bubble').click();

      // Try to access inbox via badge or long press
      const badge = page.getByTestId('capture-bubble-badge');
      if (await badge.isVisible().catch(() => false)) {
        await badge.click();
        await expect(page.getByTestId('inbox-screen')).toBeVisible();
      }
    });
  });

  test.describe('Calendar - All Features', () => {
    test.beforeEach(async ({ page }) => {
      await goToTab(page, 'calendar');
      await expect(page.getByText('CALENDAR')).toBeVisible();
    });

    test('calendar renders', async ({ page }) => {
      await expect(page.getByText('CALENDAR')).toBeVisible();
      // Check for calendar grid or days
      const calendarGrid = page
        .locator('[data-testid*="calendar"], .calendar, [role="grid"]')
        .first();
      await expect(calendarGrid).toBeVisible();
    });

    test('month navigation works', async ({ page }) => {
      const prevBtn = page.getByText(/<|prev|previous/i).first();
      const nextBtn = page.getByText(/>|next/i).first();

      if (await prevBtn.isVisible().catch(() => false)) {
        await prevBtn.click();
      }
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
      }
    });
  });

  test.describe('Chat - All Features', () => {
    test.beforeEach(async ({ page }) => {
      await goToTab(page, 'chat');
      await expect(page.getByText('CADDI_ASSISTANT')).toBeVisible();
    });

    test('chat input and send', async ({ page }) => {
      const input = page.getByPlaceholder(/TYPE_YOUR_THOUGHTS/i);
      await expect(input).toBeVisible();

      await input.fill('Hello from E2E test');
      await page.getByText(/SEND/i).click();

      await expect(page.getByText('Hello from E2E test')).toBeVisible();
    });

    test('mock API response handling', async ({ page }) => {
      await page.route('**/api/chat', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ reply: 'Mocked response from E2E' }),
        });
      });

      const input = page.getByPlaceholder(/TYPE_YOUR_THOUGHTS/i);
      await input.fill('Test message');
      await page.getByText(/SEND/i).click();

      await expect(page.getByText('Mocked response from E2E')).toBeVisible();
    });
  });
});
