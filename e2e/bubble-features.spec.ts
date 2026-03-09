import { test, expect } from '@playwright/test';
import { gotoAppRoot } from './helpers/navigation';
import {
  seedZeroReviewBubbleState,
  enableCosmicTheme,
  enableE2ETestMode,
  seedAlexPersona,
} from './helpers/seed';
import {
  CHECK_IN_ENERGY_LEVELS,
  CHECK_IN_MOODS,
} from '../src/screens/check-in/checkInData';

const isLivePagesSmoke = (process.env.PLAYWRIGHT_BASE_URL ?? '').includes(
  'github.io/ADHD-CADDI/',
);

test.describe('Bubble Features: Interruption & Vignette Check-ins', () => {
  test('main bubble opens inbox when review items are waiting', async ({
    page,
  }) => {
    await enableE2ETestMode(page);
    await seedAlexPersona(page);
    await enableCosmicTheme(page);
    await gotoAppRoot(page);
    await page.waitForLoadState('networkidle');

    const bubble = page.getByTestId('capture-bubble');
    await expect(bubble).toBeVisible();
    await bubble.click();

    await expect(page.getByTestId('inbox-screen')).toBeVisible();
    await expect(page.getByText('Call substitute coordinator')).toBeVisible();
  });

  test('zero-review bubble state opens drawer and supports check-in capture mode', async ({
    page,
  }) => {
    await enableE2ETestMode(page);
    await seedZeroReviewBubbleState(page);
    await enableCosmicTheme(page);
    await gotoAppRoot(page);
    await page.waitForLoadState('networkidle');

    const bubble = page.getByTestId('capture-bubble');
    await expect(bubble).toBeVisible();
    await bubble.click();

    const drawer = page.getByTestId('capture-drawer');
    await expect(drawer).toBeVisible();

    const checkinModeBtn = page.getByTestId('capture-mode-checkin');
    await expect(checkinModeBtn).toBeVisible();
    await checkinModeBtn.click();

    await expect(page.getByText(/what are you doing\?/i)).toBeVisible();

    const checkinInput = page.getByTestId('capture-checkin-input');
    await expect(checkinInput).toBeVisible();
    await checkinInput.fill(
      'Checking emails. I should be working on the report.',
    );

    const checkinConfirm = page.getByRole('button', { name: 'LOG PROGRESS' });
    await expect(checkinConfirm).toBeVisible();
    await checkinConfirm.click();

    await expect(drawer).not.toBeVisible({ timeout: 5000 });
  });

  test('Check In screen uses the registered route and current vignette quotes', async ({
    page,
  }) => {
    await enableE2ETestMode(page);
    await seedZeroReviewBubbleState(page);
    await enableCosmicTheme(page);
    await gotoAppRoot(page);
    await page.waitForLoadState('networkidle');

    const checkinCard = page.getByTestId('mode-checkin');
    await expect(checkinCard).toBeVisible();
    await checkinCard.click({ force: true });

    const checkInScreen = page.getByLabel('Check-in screen');
    await expect(checkInScreen).toBeVisible();

    if (!isLivePagesSmoke) {
      await expect(
        checkInScreen.getByText(CHECK_IN_MOODS[0].quote, { exact: false }),
      ).toBeVisible();
      await expect(
        checkInScreen.getByText(CHECK_IN_ENERGY_LEVELS[4].quote, {
          exact: false,
        }),
      ).toBeVisible();
    }

    await checkInScreen.getByTestId('mood-option-1').click();
    await checkInScreen.getByTestId('energy-option-1').click();

    await expect(page.getByText(/RECOMMENDED FOR YOU/i)).toBeVisible();

    const actionButton = page.getByTestId('recommendation-action-button');
    await expect(actionButton).toBeVisible();
    await expect(actionButton).toHaveText(/OPEN ANCHOR/i);
  });
});
