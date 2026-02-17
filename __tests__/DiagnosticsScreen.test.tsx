import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';
import { Platform, Share } from 'react-native';
import DiagnosticsScreen from '../src/screens/DiagnosticsScreen';

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockRemove = jest.fn();
const mockGetJSON = jest.fn();

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
    getJSON: (...args: unknown[]) => mockGetJSON(...args),
    STORAGE_KEYS: {
      streakCount: 'streakCount',
      lastUseDate: 'lastUseDate',
      theme: 'theme',
      tasks: 'tasks',
      brainDump: 'brainDump',
      igniteState: 'igniteState',
      pomodoroState: 'pomodoroState',
      firstSuccessGuideState: 'firstSuccessGuideState',
      uxMetricsEvents: 'uxMetricsEvents',
      activationSessions: 'activationSessions',
      activationPendingStart: 'activationPendingStart',
      lastActiveSession: 'lastActiveSession',
      retentionGraceWindowStart: 'retentionGraceWindowStart',
      retentionGraceDaysUsed: 'retentionGraceDaysUsed',
      googleTasksSyncState: 'googleTasksSyncState',
      googleTasksProcessedIds: 'googleTasksProcessedIds',
      googleTasksLastSyncAt: 'googleTasksLastSyncAt',
      googleTasksExportedFingerprints: 'googleTasksExportedFingerprints',
      backupLastExportAt: 'backupLastExportAt',
    },
  },
}));

const mockNavigation = {
  goBack: jest.fn(),
};

describe('DiagnosticsScreen backup tools', () => {
  jest.setTimeout(20000);

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'web',
    });
    mockGet.mockResolvedValue(null);
    mockGetJSON.mockResolvedValue([]);
    mockSet.mockResolvedValue(true);
    mockRemove.mockResolvedValue(true);
    jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'sharedAction',
      activityType: null,
    });
  });

  it('exports backup JSON into the backup input', async () => {
    render(<DiagnosticsScreen navigation={mockNavigation} />);

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.press(screen.getByTestId('diagnostics-export-backup'));

    await waitFor(() => {
      const input = screen.getByTestId('diagnostics-backup-input');
      expect(String(input.props.value)).toContain(
        '"schema": "spark-backup-v1"',
      );
      expect(mockSet).toHaveBeenCalledWith(
        'backupLastExportAt',
        expect.any(String),
      );
    });
  });

  it('imports valid backup JSON (default overwrite) and writes tracked keys while removing absent ones', async () => {
    render(<DiagnosticsScreen navigation={mockNavigation} />);

    await act(async () => {
      await Promise.resolve();
    });

    const payload = {
      schema: 'spark-backup-v1',
      exportedAt: new Date().toISOString(),
      app: 'spark-adhd',
      data: {
        tasks: '[{"id":"1","text":"test"}]',
        // 'brainDump' is missing, so it should be removed
      },
    };

    fireEvent.changeText(
      screen.getByTestId('diagnostics-backup-input'),
      JSON.stringify(payload),
    );

    fireEvent.press(screen.getByTestId('diagnostics-import-backup'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSet).toHaveBeenCalledWith('tasks', '[{"id":"1","text":"test"}]');
    // Verify removal of missing keys (e.g. brainDump is in STORAGE_KEYS but not in payload)
    expect(mockRemove).toHaveBeenCalledWith('brainDump');
  });

  it('imports valid backup JSON (merge mode) and updates only present keys without removals', async () => {
    render(<DiagnosticsScreen navigation={mockNavigation} />);

    await act(async () => {
      await Promise.resolve();
    });

    // Switch to merge mode
    fireEvent.press(screen.getByTestId('import-mode-merge'));

    const payload = {
      schema: 'spark-backup-v1',
      exportedAt: new Date().toISOString(),
      app: 'spark-adhd',
      data: {
        tasks: '[{"id":"1","text":"test-merge"}]',
      },
    };

    fireEvent.changeText(
      screen.getByTestId('diagnostics-backup-input'),
      JSON.stringify(payload),
    );

    fireEvent.press(screen.getByTestId('diagnostics-import-backup'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSet).toHaveBeenCalledWith(
      'tasks',
      '[{"id":"1","text":"test-merge"}]',
    );
    // In merge mode, we do NOT iterate over all exportableKeys to remove missing ones.
    // We only iterate over payload keys.
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('rejects invalid backup payload schema', async () => {
    render(<DiagnosticsScreen navigation={mockNavigation} />);

    await act(async () => {
      await Promise.resolve();
    });

    const invalidPayload = {
      schema: 'invalid-backup-v9',
      exportedAt: new Date().toISOString(),
      app: 'spark-adhd',
      data: {
        tasks: '[{"id":"1"}]',
      },
    };

    fireEvent.changeText(
      screen.getByTestId('diagnostics-backup-input'),
      JSON.stringify(invalidPayload),
    );

    fireEvent.press(screen.getByTestId('diagnostics-import-backup'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/Unsupported backup schema/i)).toBeTruthy();
    expect(mockSet).not.toHaveBeenCalledWith('tasks', '[{"id":"1"}]');
  });
});
