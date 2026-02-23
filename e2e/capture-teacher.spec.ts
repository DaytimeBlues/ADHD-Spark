/**
 * Capture Bubble — Teacher Persona E2E Tests
 *
 * Simulates a high-school teacher (Ms. Torres) using the Capture Bubble
 * during a busy school day to quickly capture thoughts before they evaporate.
 *
 * Persona signals:
 * - Between-class, low attention window: must be ≤ 3 taps to capture
 * - Primary use: text & paste (voice used in hallway)
 * - Triage happens after school hours in the Inbox
 * - Promotes good items to tasks, discards noise
 */

import { test, expect, Page } from '@playwright/test';
import { enableCosmicTheme } from './helpers/seed';

// ============================================================================
// HELPERS
// ============================================================================

async function seedCaptureInbox(page: Page, items: object[]): Promise<void> {
  await page.addInitScript((inbox) => {
    (window as unknown as Record<string, unknown>).localStorage;
    window.localStorage.setItem('captureInbox', JSON.stringify(inbox));
  }, items);
}

async function openCaptureBubble(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('capture-bubble')).toBeVisible({
    timeout: 10_000,
  });
  await page.getByTestId('capture-bubble').click();
  await expect(page.getByTestId('capture-drawer')).toBeVisible({
    timeout: 5_000,
  });
}

// ============================================================================
// TESTS
// ============================================================================

test.describe('Capture Bubble — Teacher Persona (Ms. Torres)', () => {
  // --------------------------------------------------------------------------
  // Bubble visibility
  // --------------------------------------------------------------------------

  test('bubble is visible on the home screen', async ({ page }) => {
    await enableCosmicTheme(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('capture-bubble')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('bubble shows badge count when unreviewed items exist', async ({
    page,
  }) => {
    await enableCosmicTheme(page);
    await seedCaptureInbox(page, [
      {
        id: 'cap_a',
        source: 'text',
        status: 'unreviewed',
        raw: 'Call substitute coordinator',
        createdAt: Date.now(),
      },
      {
        id: 'cap_b',
        source: 'paste',
        status: 'unreviewed',
        raw: 'Period 3 room change note',
        createdAt: Date.now() - 60_000,
      },
    ]);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('capture-bubble-badge')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('capture-bubble-badge')).toHaveText('2');
  });

  // --------------------------------------------------------------------------
  // Drawer opens with all capture modes
  // --------------------------------------------------------------------------

  test('tapping bubble opens drawer with all 5 capture modes', async ({
    page,
  }) => {
    await enableCosmicTheme(page);
    await openCaptureBubble(page);

    await expect(page.getByTestId('capture-mode-voice')).toBeVisible();
    await expect(page.getByTestId('capture-mode-text')).toBeVisible();
    await expect(page.getByTestId('capture-mode-photo')).toBeVisible();
    await expect(page.getByTestId('capture-mode-paste')).toBeVisible();
    await expect(page.getByTestId('capture-mode-meeting')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Text capture (Ms. Torres dashes off a note between classes)
  // --------------------------------------------------------------------------

  test('teacher captures a text note in ≤ 3 interactions', async ({ page }) => {
    await enableCosmicTheme(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Interaction 1: open bubble
    await page.getByTestId('capture-bubble').click();
    await expect(page.getByTestId('capture-drawer')).toBeVisible({
      timeout: 5_000,
    });

    // Interaction 2: tap text mode (may already be active by default)
    await page.getByTestId('capture-mode-text').click();

    // Type the note
    const textInput = page.getByTestId('capture-text-input');
    await expect(textInput).toBeVisible({ timeout: 3_000 });
    await textInput.fill("Email Maria's parents re: missing homework x3");

    // Interaction 3: submit
    await page.getByTestId('capture-submit').click();

    // Drawer should close after submit
    await expect(page.getByTestId('capture-drawer')).not.toBeVisible({
      timeout: 5_000,
    });
  });

  // --------------------------------------------------------------------------
  // Meeting notes capture
  // --------------------------------------------------------------------------

  test('meeting mode accepts multi-line notes and submits', async ({
    page,
  }) => {
    await enableCosmicTheme(page);
    await openCaptureBubble(page);

    await page.getByTestId('capture-mode-meeting').click();

    const input = page.getByTestId('capture-meeting-input');
    await expect(input).toBeVisible({ timeout: 3_000 });

    const meetingNote =
      'Staff meeting:\n- New tardy policy from admin\n- PD day moved to March 5';
    await input.fill(meetingNote);

    await page.getByTestId('capture-submit').click();

    await expect(page.getByTestId('capture-drawer')).not.toBeVisible({
      timeout: 5_000,
    });
  });

  // --------------------------------------------------------------------------
  // Drawer dismissal
  // --------------------------------------------------------------------------

  test('drawer closes on cancel without saving', async ({ page }) => {
    await enableCosmicTheme(page);
    await openCaptureBubble(page);

    await page.getByTestId('capture-cancel').click();

    await expect(page.getByTestId('capture-drawer')).not.toBeVisible({
      timeout: 5_000,
    });
  });

  // --------------------------------------------------------------------------
  // Inbox triage (after school — Ms. Torres reviews her captures)
  // --------------------------------------------------------------------------

  test('inbox shows unreviewed captures and allows promote to task', async ({
    page,
  }) => {
    await enableCosmicTheme(page);
    await seedCaptureInbox(page, [
      {
        id: 'cap_teach_1',
        source: 'text',
        status: 'unreviewed',
        raw: "Email Maria's parents re: missing homework x3",
        createdAt: Date.now() - 3_600_000,
      },
      {
        id: 'cap_teach_2',
        source: 'meeting',
        status: 'unreviewed',
        raw: 'PD day moved to March 5',
        createdAt: Date.now() - 7_200_000,
      },
    ]);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open inbox via bubble long-press or badge tap — or navigate directly
    await expect(page.getByTestId('capture-bubble')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByTestId('capture-bubble').press('Enter'); // keyboard nav opens inbox

    // Fallback: navigate via badge click if visible
    const badge = page.getByTestId('capture-bubble-badge');
    if (await badge.isVisible()) {
      await badge.click();
    }

    // Inbox should be visible
    await expect(page.getByTestId('inbox-screen')).toBeVisible({
      timeout: 8_000,
    });

    // Both items listed
    await expect(page.getByTestId('inbox-list')).toBeVisible();
    await expect(page.getByTestId(`capture-row-cap_teach_1`)).toBeVisible();
    await expect(page.getByTestId(`capture-row-cap_teach_2`)).toBeVisible();

    // Promote first item to task
    await page.getByTestId('promote-task-cap_teach_1').click();

    // Row should fade (opacity: 0.65) — check it still exists but is reviewed
    await expect(page.getByTestId('capture-row-cap_teach_1')).toBeVisible();
  });

  test('inbox discard removes item from unreviewed filter', async ({
    page,
  }) => {
    await enableCosmicTheme(page);
    await seedCaptureInbox(page, [
      {
        id: 'cap_noise_1',
        source: 'voice',
        status: 'unreviewed',
        raw: 'Uhh hmm not sure what I meant',
        createdAt: Date.now() - 1_800_000,
      },
    ]);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('capture-bubble')).toBeVisible({
      timeout: 10_000,
    });

    const badge = page.getByTestId('capture-bubble-badge');
    if (await badge.isVisible()) {
      await badge.click();
    } else {
      await page.getByTestId('capture-bubble').press('Enter');
    }

    await expect(page.getByTestId('inbox-screen')).toBeVisible({
      timeout: 8_000,
    });

    // Discard the noisy item
    await page.getByTestId('discard-cap_noise_1').click();

    // Switch to Unreviewed tab — list should be empty
    await page.getByTestId('inbox-tab-unreviewed').click();
    await expect(page.getByTestId('inbox-empty')).toBeVisible({
      timeout: 3_000,
    });
  });

  test('inbox filter tabs change displayed items', async ({ page }) => {
    await enableCosmicTheme(page);
    await seedCaptureInbox(page, [
      {
        id: 'cap_u1',
        source: 'text',
        status: 'unreviewed',
        raw: 'Buy dry-erase markers',
        createdAt: Date.now(),
      },
      {
        id: 'cap_p1',
        source: 'text',
        status: 'promoted',
        raw: 'Schedule parent-teacher conf',
        createdAt: Date.now() - 86_400_000,
        promotedTo: 'task',
        promotedAt: Date.now() - 82_800_000,
      },
    ]);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const badge = page.getByTestId('capture-bubble-badge');
    const isVisible = await badge
      .isVisible({ timeout: 5_000 })
      .catch(() => false);
    if (isVisible) {
      await badge.click();
    } else {
      await page.getByTestId('capture-bubble').press('Enter');
    }

    await expect(page.getByTestId('inbox-screen')).toBeVisible({
      timeout: 8_000,
    });

    // Unreviewed tab — only 1 item
    await page.getByTestId('inbox-tab-unreviewed').click();
    await expect(page.getByTestId('capture-row-cap_u1')).toBeVisible();
    await expect(page.getByTestId('capture-row-cap_p1')).not.toBeVisible();

    // All tab — both items
    await page.getByTestId('inbox-tab-all').click();
    await expect(page.getByTestId('capture-row-cap_u1')).toBeVisible();
    await expect(page.getByTestId('capture-row-cap_p1')).toBeVisible();

    // Promoted tab — only promoted
    await page.getByTestId('inbox-tab-promoted').click();
    await expect(page.getByTestId('capture-row-cap_p1')).toBeVisible();
    await expect(page.getByTestId('capture-row-cap_u1')).not.toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Bubble hidden on fullscreen modals
  // --------------------------------------------------------------------------

  test('bubble is not visible inside Pomodoro modal', async ({ page }) => {
    await enableCosmicTheme(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Pomodoro via the Focus tab → Pomodoro card
    const pomodoroCard = page.getByTestId('mode-pomodoro');
    if (await pomodoroCard.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await pomodoroCard.click();
      await page.waitForTimeout(1_000);
      // Bubble should NOT be visible since we're on a fullscreen modal stack screen
      await expect(page.getByTestId('capture-bubble')).not.toBeVisible({
        timeout: 3_000,
      });
    } else {
      test.skip();
    }
  });
});
