import { test, expect } from '@playwright/test';
import {
  enableCosmicTheme,
  enableE2ETestMode,
  seedAlexPersona,
} from './helpers/seed';

test.describe('Bubble Features: Interruption & Vignette Check-ins', () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await seedAlexPersona(page);
    await enableCosmicTheme(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Check-In Mode (Interruption) in Capture Drawer', () => {
    test('Can open Capture Drawer and log progress through Check-in mode', async ({
      page,
    }) => {
      // 1. Open Capture Bubble
      const bubble = page.getByTestId('capture-bubble');
      await expect(bubble).toBeVisible();
      await bubble.click();

      // 2. Open Drawer
      const drawer = page.getByTestId('capture-drawer');
      await expect(drawer).toBeVisible();

      // 3. Switch to Check-in Mode
      const checkinModeBtn = page.getByTestId('capture-mode-checkin');
      await expect(checkinModeBtn).toBeVisible();
      await checkinModeBtn.click();

      // 4. Verify Prompts
      const promptText = page.getByText(/what are you doing\?/i);
      await expect(promptText).toBeVisible();

      // 5. Fill input and Submit
      const checkinInput = page.getByTestId('capture-checkin-input');
      await expect(checkinInput).toBeVisible();
      await checkinInput.fill(
        'Checking emails. I should be working on the report.',
      );

      const checkinConfirm = page.getByTestId('capture-checkin-confirm');
      await expect(checkinConfirm).toBeVisible();
      await checkinConfirm.click();

      // 6. Verify Drawer closes or success state
      await expect(drawer).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Vignettes in CheckInScreen', () => {
    test('CheckInScreen displays literary vignettes instead of emojis', async ({
      page,
    }) => {
      // 1. Navigate to CheckInScreen
      // Using the home mode grid (mode-checkin)
      const checkinCard = page.getByTestId('mode-checkin');
      await expect(checkinCard).toBeVisible();
      await checkinCard.click({ force: true });

      // 2. Check for Vignette Quotes instead of emojis
      const nietzscheQuote = page.getByText(
        '“I am a forest, and a night of dark trees.”',
        { exact: false },
      );
      await expect(nietzscheQuote).toBeVisible();

      const whitmanQuote = page.getByText('“I contain multitudes.”', {
        exact: false,
      });
      await expect(whitmanQuote).toBeVisible();

      // 3. Select items to show recommendation
      const lowMoodBtn = page.getByTestId('mood-option-1');
      await lowMoodBtn.click();

      const lowEnergyBtn = page.getByTestId('energy-option-1');
      await lowEnergyBtn.click();

      // 4. Validate recommendation has appeared
      const recommendationText = page.getByText(/RECOMMENDED FOR YOU/i);
      await expect(recommendationText).toBeVisible();

      const actionButton = page.getByTestId('recommendation-action-button');
      await expect(actionButton).toBeVisible();
      await expect(actionButton).toHaveText(/OPEN ANCHOR/i);
    });
  });
});
