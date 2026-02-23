import { Page } from '@playwright/test';

const daysAgoIso = (days: number): string => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
};

export const seedAlexPersona = async (page: Page): Promise<void> => {
  const activationSessions = [
    {
      id: 'session-alex-1',
      startedAt: daysAgoIso(2),
      endedAt: daysAgoIso(2),
      status: 'completed',
      source: 'ignite',
    },
    {
      id: 'session-alex-2',
      startedAt: daysAgoIso(1),
      endedAt: daysAgoIso(1),
      status: 'completed',
      source: 'checkin_prompt',
    },
    {
      id: 'session-alex-3',
      startedAt: daysAgoIso(0),
      status: 'started',
      source: 'fogcutter_handoff',
    },
  ];

  const brainDump = [
    {
      id: 'alex-note-1',
      text: 'Grade 30 assignments before 3pm',
      createdAt: daysAgoIso(0),
      source: 'text',
    },
    {
      id: 'alex-note-2',
      text: 'Email parent back about schedule change',
      createdAt: daysAgoIso(0),
      source: 'text',
    },
  ];

  const tasks = [
    {
      id: 'alex-task-1',
      text: 'Prepare tomorrow lesson objectives',
      completed: false,
      microSteps: [
        { id: 'm1', text: 'Review curriculum goals', status: 'in_progress' },
        { id: 'm2', text: 'Draft 3 outcomes', status: 'next' },
      ],
    },
  ];

  // Capture inbox items for Zustand store (wrapped in store state format)
  const captureInboxItems = [
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
  ];

  await page.addInitScript(
    (seed) => {
      window.localStorage.clear();
      window.localStorage.setItem('streakCount', '3');
      window.localStorage.setItem(
        'lastUseDate',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      );
      window.localStorage.setItem(
        'activationSessions',
        JSON.stringify(seed.activationSessions),
      );
      window.localStorage.setItem('brainDump', JSON.stringify(seed.brainDump));
      window.localStorage.setItem('tasks', JSON.stringify(seed.tasks));
      // Zustand store format for capture inbox
      window.localStorage.setItem(
        'captureInbox',
        JSON.stringify({
          state: {
            items: seed.captureInboxItems,
            _hasHydrated: true,
          },
          version: 0,
        }),
      );
    },
    {
      activationSessions,
      brainDump,
      tasks,
      captureInboxItems,
    },
  );
};

export const enableE2ETestMode = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    (window as any).process = { env: {} };
    (window as unknown as Record<string, unknown>).__SPARK_E2E_TEST_MODE__ =
      true;
  });
};

export const enableCosmicTheme = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem('theme', 'cosmic');
  });
};

export const enableRecordingMock = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const globalRecord = window as unknown as Record<string, unknown>;
    globalRecord.__SPARK_E2E_RECORDING_MOCK__ = {
      failStart: false,
      failStop: false,
      duration: 1800,
      uri: 'mock://spark-recording.m4a',
    };
    globalRecord.__SPARK_E2E_TRANSCRIBE_MOCK__ =
      'Mocked teacher note from voice capture.';
  });
};
