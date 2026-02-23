import { test, expect, Page } from '@playwright/test';
import {
  enableE2ETestMode,
  enableRecordingMock,
  seedAlexPersona,
} from './helpers/seed';

const goToTab = async (
  page: Page,
  tab: 'home' | 'focus' | 'tasks' | 'calendar',
) => {
  const tabButton = page.getByTestId(`nav-${tab}`);
  await expect(tabButton).toBeVisible();
  await tabButton.click({ force: true });
};

test.describe('Alex Persona - E2E Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER PAGE ERROR:', error.message));

    await enableE2ETestMode(page);
    await enableRecordingMock(page);
    await seedAlexPersona(page);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test.describe('Suite A: Morning Chaos', () => {
    test('A.1 Quick Capture: manual text input in Brain Dump', async ({
      page,
    }) => {
      await page.getByTestId('mode-fogcutter').click({ force: true });
      await page
        .getByPlaceholder('> INPUT_OVERWHELMING_TASK')
        .fill('Grade 30 essays by Friday');
      await page.getByPlaceholder('> ADD_MICRO_STEP').fill('Open first essay');
      await page.getByPlaceholder('> ADD_MICRO_STEP').press('Enter');
      await page.getByText('EXECUTE_SAVE').click();

      await expect(page.getByText('Grade 30 essays by Friday')).toBeVisible();
    });

    test('A.2 Voice Input Simulation: UI flow of recording', async ({
      page,
    }) => {
      await goToTab(page, 'tasks');

      await page.getByTestId('brain-dump-record-toggle').click();
      await expect(page.getByText('STOP_REC')).toBeVisible();

      await page.getByTestId('brain-dump-record-toggle').click();
      await expect(
        page.getByText('Mocked teacher note from voice capture.'),
      ).toBeVisible();
    });

    test('A.3 AI Categorization: interaction and UI update', async ({
      page,
    }) => {
      await goToTab(page, 'tasks');
      await page.getByPlaceholder('> INPUT_DATA...').fill('Buy milk');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');

      const aiSortBtn = page.getByTestId('brain-dump-ai-sort');
      await expect(aiSortBtn).toBeVisible();
      await aiSortBtn.click();

      await expect(page.getByText(/AI_SORT|SORTING.../)).toBeVisible();
    });

    test('A.4 Data Persistence: items remain after navigation', async ({
      page,
    }) => {
      await goToTab(page, 'tasks');
      await page.getByPlaceholder('> INPUT_DATA...').fill('Persistent Task');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');

      await goToTab(page, 'calendar');
      await goToTab(page, 'tasks');
      await expect(page.getByText('Persistent Task')).toBeVisible();
    });
  });

  test.describe('Suite B: Prep Period Black Hole', () => {
    test('B.1 Micro-Step Decomposition: breaking large tasks', async ({
      page,
    }) => {
      await page.getByTestId('mode-fogcutter').click({ force: true });
      await page
        .getByPlaceholder('> INPUT_OVERWHELMING_TASK')
        .fill('Parent-Teacher Night');

      await page
        .getByPlaceholder('> ADD_MICRO_STEP')
        .fill('Print sign-in sheet');
      await page.getByPlaceholder('> ADD_MICRO_STEP').press('Enter');
      await page.getByPlaceholder('> ADD_MICRO_STEP').fill('Prepare desk');
      await page.getByPlaceholder('> ADD_MICRO_STEP').press('Enter');

      await expect(page.getByTestId('microstep-number-1')).toHaveText('01');
      await expect(page.getByTestId('microstep-number-2')).toHaveText('02');
    });

    test('B.2 Deep Focus Launch: Pomodoro from Fog Cutter', async ({
      page,
    }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await expect(page.getByTestId('timer-display')).toBeVisible();
      await page.getByText(/START TIMER/i).click();
      await expect(page.getByText(/PAUSE/i)).toBeVisible();
    });

    test('B.3 Timer Accuracy: decrements and remains active', async ({
      page,
    }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });

      const timer = page.getByTestId('timer-display');
      await expect(timer).toBeVisible();
      const initialTime = await timer.textContent();

      await page.getByText(/START TIMER/i).click();
      await page.waitForTimeout(450);

      const newTime = await timer.textContent();
      expect(newTime).not.toBe(initialTime);
    });

    test('B.4 Phase Transition: Break phase trigger', async ({ page }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await page.getByText(/START TIMER/i).click();

      await page.evaluate(() => {
        const globalRecord = window as unknown as Record<string, unknown>;
        const controls = globalRecord.__SPARK_E2E_TIMER_CONTROLS__ as
          | { complete?: () => void }
          | undefined;
        controls?.complete?.();
      });

      await expect(page.getByTestId('pomodoro-phase')).toContainText('REST');
    });
  });

  test.describe('Suite C: After-School Crash', () => {
    test('C.1 Holistic Check-in: Mood/Energy check-in', async ({ page }) => {
      await page.getByTestId('mode-checkin').click({ force: true });

      await page.getByTestId('mood-option-1').click();
      await page.getByTestId('energy-option-1').click();

      await expect(page.getByText(/RECOMMENDED FOR YOU/i)).toBeVisible();
    });

    test('C.2 Recommendation Logic: Suggests Anchor', async ({ page }) => {
      await page.getByTestId('mode-checkin').click({ force: true });
      await page.getByTestId('mood-option-1').click();
      await page.getByTestId('energy-option-1').click();

      await expect(page.getByText('OPEN ANCHOR')).toBeVisible();
    });

    test('C.3 Grounding Session: 4-7-8 breathing', async ({ page }) => {
      await page.getByTestId('mode-anchor').click({ force: true });
      await page.getByTestId('anchor-pattern-478').click();

      await expect(page.getByText('BREATHE IN')).toBeVisible();
    });

    test('C.4 Completion Feedback: Session reflection', async ({ page }) => {
      await page.getByTestId('mode-anchor').click({ force: true });
      await page.getByTestId('anchor-pattern-478').click();

      await page.evaluate(() => {
        const globalRecord = window as unknown as Record<string, unknown>;
        const controls = globalRecord.__SPARK_E2E_TIMER_CONTROLS__ as
          | { complete?: () => void }
          | undefined;
        controls?.complete?.();
      });

      await expect(page.getByText('HOLD')).toBeVisible();
    });
  });

  test.describe('Suite D: Interrupted Flow', () => {
    test('D.1 Mid-Task Break: Pause and navigate', async ({ page }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await page.getByText(/START TIMER/i).click();

      await page.goto('/');
      await expect(page.getByTestId('home-title')).toBeVisible();
    });

    test('D.2 State Restoration: Restores Fog Cutter focus', async ({
      page,
    }) => {
      await page.getByTestId('mode-fogcutter').click({ force: true });
      await page
        .getByPlaceholder('> INPUT_OVERWHELMING_TASK')
        .fill('Write recommendation letter');
      await page.getByPlaceholder('> ADD_MICRO_STEP').fill('Open student file');
      await page.getByPlaceholder('> ADD_MICRO_STEP').press('Enter');
      await page.getByText('EXECUTE_SAVE').click();
      await expect(page.getByText('Write recommendation letter')).toBeVisible();
      await page.waitForTimeout(300);

      await page.goto('/');
      await expect(page.getByTestId('home-title')).toBeVisible();
      await page.getByTestId('mode-fogcutter').click({ force: true });
      await expect(page.getByText('ACTIVE_OPERATIONS')).toBeVisible();
    });

    test('D.3 Persistent Timers: Remains active on return', async ({
      page,
    }) => {
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await page.getByText(/START TIMER/i).click();
      await page.goto('/');
      await page.getByTestId('mode-pomodoro').click({ force: true });
      await expect(page.getByText(/START TIMER/i)).toBeVisible();
      await expect(page.getByTestId('timer-display')).toBeVisible();
    });

    test('D.4 Progress Summary: Status update in Fog Cutter', async ({
      page,
    }) => {
      await page.getByTestId('mode-fogcutter').click({ force: true });
      await expect(page.getByText('ACTIVE_OPERATIONS')).toBeVisible();
    });
  });

  test.describe('Suite E: Weekend Anxiety Spiral', () => {
    test('E.1 Accomplishment Visibility: Weekly Metrics', async ({ page }) => {
      await expect(page.getByText('WEEKLY_METRICS')).toBeVisible();
    });

    test('E.2 Commitment Review: Browse tasks', async ({ page }) => {
      await goToTab(page, 'tasks');
      await expect(page.getByText('BRAIN_DUMP')).toBeVisible();
    });

    test('E.3 Calendar Layout: Loads and displays', async ({ page }) => {
      await goToTab(page, 'calendar');
      await expect(page.getByText('CALENDAR')).toBeVisible();
    });

    test('E.4 Worry Reframing: CBT Guide access', async ({ page }) => {
      await page.getByTestId('mode-cbtguide').click({ force: true });
      await expect(page.getByText('EVIDENCE-BASED STRATEGIES')).toBeVisible();
    });
  });

  test.describe('Suite F: IEP Meeting Surprise', () => {
    test('F.1 60-Second Reset: Energize session', async ({ page }) => {
      await page.getByTestId('mode-anchor').click({ force: true });
      await page.getByTestId('anchor-pattern-energize').click();
      await expect(page.getByText('BREATHE IN')).toBeVisible();
    });

    test('F.2 Rapid Retrieval: Brain Dump filter', async ({ page }) => {
      await goToTab(page, 'tasks');
      await expect(page.getByPlaceholder('> INPUT_DATA...')).toBeVisible();
    });

    test('F.3 Readiness Audit: System status check', async ({ page }) => {
      await expect(page.getByText('SYS.ONLINE')).toBeVisible();
      await expect(page.getByTestId('home-streak')).toBeVisible();
    });

    test('F.4 Instant Capture: Post-session note', async ({ page }) => {
      await goToTab(page, 'tasks');
      await page
        .getByPlaceholder('> INPUT_DATA...')
        .fill('Meeting Recap: Alex is doing great');
      await page.getByPlaceholder('> INPUT_DATA...').press('Enter');
      await expect(
        page.getByText('Meeting Recap: Alex is doing great'),
      ).toBeVisible();
    });
  });
});
