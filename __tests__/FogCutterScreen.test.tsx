import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FogCutterScreen from '../src/screens/FogCutterScreen';
import { useTaskStore } from '../src/store/useTaskStore';

const mockGetJSON = jest.fn();

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: (...args: unknown[]) => mockGetJSON(...args),
    setJSON: jest.fn(),
    STORAGE_KEYS: {
      tasks: 'tasks',
      firstSuccessGuideState: 'firstSuccessGuideState',
    },
  },
  zustandStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/components/ui/LinearButton', () => ({
  LinearButton: ({ title }: { title: string }) => <>{title}</>,
}));

describe('FogCutterScreen', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockGetJSON.mockReset();
    useTaskStore.setState({ tasks: [], _hasHydrated: true });
  });

  it('loads canonical tasks and renders them', async () => {
    mockGetJSON.mockImplementation((_key: string) => {
      return Promise.resolve(null);
    });
    useTaskStore.setState({
      tasks: [
        {
          id: 'task-1',
          title: 'Draft outline',
          priority: 'normal',
          completed: false,
          source: 'manual',
          microSteps: [
            { id: 'step-1', text: 'Step 1', status: 'in_progress' },
            { id: 'step-2', text: 'Step 2', status: 'next' },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      _hasHydrated: true,
    });

    render(<FogCutterScreen />);

    expect(await screen.findByText('Draft outline')).toBeTruthy();
    expect(await screen.findByText('0/2 DONE')).toBeTruthy();
  }, 15000);
});
