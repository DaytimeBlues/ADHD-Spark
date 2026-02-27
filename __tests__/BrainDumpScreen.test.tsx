import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import BrainDumpScreen from '../src/screens/BrainDumpScreen';

jest.mock('@react-navigation/native', () => ({
  __esModule: true,
  useRoute: () => ({ params: {} }),
}));

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: jest.fn().mockResolvedValue(null),
    setJSON: jest.fn().mockResolvedValue(true),
    STORAGE_KEYS: {
      brainDump: 'brainDump',
      firstSuccessGuideState: 'firstSuccessGuideState',
      tasks: 'tasks',
    },
  },
}));

jest.mock('../src/services/RecordingService', () => ({
  __esModule: true,
  default: {
    startRecording: jest.fn().mockResolvedValue(false),
    stopRecording: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../src/services/PlaudService', () => ({
  __esModule: true,
  default: {
    transcribe: jest.fn().mockResolvedValue({ success: false, error: 'mock' }),
  },
  GoogleTasksSyncService: {
    syncSortedItemsToGoogle: jest.fn().mockResolvedValue({
      createdTasks: 0,
      createdEvents: 0,
      skippedCount: 0,
      authRequired: false,
    }),
    signInInteractive: jest.fn().mockResolvedValue(false),
  },
}));

jest.mock('../src/services/AISortService', () => ({
  __esModule: true,
  default: {
    sortItems: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    updateCount: jest.fn(),
  },
}));

jest.mock('../src/services/UXMetricsService', () => ({
  __esModule: true,
  default: {
    track: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  LoggerService: {
    error: jest.fn(),
  },
}));

jest.mock('../src/components/brain-dump', () => {
  const React = require('react');
  const { Text, View, Pressable } = require('react-native');

  return {
    BrainDumpItem: ({ item }: { item: { text: string } }) => (
      <Text>{item.text}</Text>
    ),
    BrainDumpInput: ({ onAdd }: { onAdd: (text: string) => void }) => (
      <Pressable onPress={() => onAdd('test input')}>
        <Text>INPUT</Text>
      </Pressable>
    ),
    BrainDumpActionBar: () => <Text>ACTION_BAR</Text>,
    BrainDumpRationale: () => <Text>RATIONALE</Text>,
    BrainDumpGuide: () => <View />,
    BrainDumpVoiceRecord: () => <Text>VOICE_RECORD</Text>,
  };
});

describe('BrainDumpScreen', () => {
  it('renders brain dump shell UI', async () => {
    render(<BrainDumpScreen />);

    expect(screen.getByText('BRAIN_DUMP')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('ACTION_BAR')).toBeTruthy();
    });
    expect(screen.getByText('_AWAITING_INPUT')).toBeTruthy();
  });
});
