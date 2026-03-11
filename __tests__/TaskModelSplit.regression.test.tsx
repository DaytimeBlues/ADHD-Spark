import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { TaskCaptureMode } from '../src/components/capture/modes/TaskCaptureMode';
import { CaptureBubble } from '../src/components/capture/CaptureBubble';
import BrainDumpScreen from '../src/screens/BrainDumpScreen';
import { useTaskStore } from '../src/store/useTaskStore';

type MockTutorialStep = { title: string };
type MockTutorialFlow = { id: string; steps: MockTutorialStep[] };

const mockBrainDumpFlow: MockTutorialFlow = {
  id: 'brain-dump-onboarding',
  steps: [{ title: 'Brain Dump: Clear the Noise' }],
};

const tutorialState = {
  activeFlow: null as MockTutorialFlow | null,
  currentStepIndex: 0,
  isVisible: false,
  onboardingCompleted: false,
};

jest.mock('@react-navigation/native', () => ({
  __esModule: true,
  useRoute: () => ({ params: {} }),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View: MockView } = require('react-native');
  return {
    GestureHandlerRootView: MockView,
    PanGestureHandler: MockView,
    TapGestureHandler: MockView,
    State: {},
    Directions: {},
  };
});

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('../src/utils/PlatformUtils', () => {
  const state = { isWeb: true, isAndroid: false, isIOS: false };
  return {
    get isWeb() {
      return state.isWeb;
    },
    get isAndroid() {
      return state.isAndroid;
    },
    get isIOS() {
      return state.isIOS;
    },
    _state: state,
  };
});

jest.mock('../src/services/CaptureService', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn((callback: (count: number) => void) => {
      callback(0);
      return jest.fn();
    }),
  },
}));

jest.mock('../src/services/CheckInService', () => ({
  __esModule: true,
  CheckInService: {
    subscribe: jest.fn((callback: (isPending: boolean) => void) => {
      callback(false);
      return jest.fn();
    }),
    setPending: jest.fn(),
  },
}));

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    updateCount: jest.fn(),
  },
}));

jest.mock('../src/navigation/navigationRef', () => ({
  __esModule: true,
  navigationRef: {
    isReady: jest.fn(() => true),
    navigate: jest.fn(),
  },
}));

jest.mock('../src/components/capture/CaptureDrawer', () => ({
  __esModule: true,
  CaptureDrawer: () => null,
}));

jest.mock('../src/components/capture/CaptureBubbleFab', () => ({
  __esModule: true,
  CaptureBubbleFab: ({ totalBadgeCount }: { totalBadgeCount: number }) => {
    const { Text, View } = require('react-native');
    return (
      <View>
        {totalBadgeCount > 0 ? (
          <Text testID="capture-bubble-badge">{String(totalBadgeCount)}</Text>
        ) : null}
      </View>
    );
  },
}));

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: jest.fn().mockImplementation(async (key: string) => {
      if (key === 'firstSuccessGuideState') {
        return null;
      }
      if (key === 'brainDump') {
        return [];
      }
      if (key === 'tasks') {
        return [];
      }
      return null;
    }),
    setJSON: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue({ success: true }),
    remove: jest.fn().mockResolvedValue({ success: true }),
    STORAGE_KEYS: {
      brainDump: 'brainDump',
      firstSuccessGuideState: 'firstSuccessGuideState',
      tasks: 'tasks',
    },
  },
  zustandStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/store/useTutorialStore', () => ({
  __esModule: true,
  brainDumpOnboardingFlow: mockBrainDumpFlow,
  useTutorialStore: (
    selector: (state: {
      activeFlow: MockTutorialFlow | null;
      currentStepIndex: number;
      isVisible: boolean;
      onboardingCompleted: boolean;
      startTutorial: (flow: MockTutorialFlow) => void;
      nextStep: () => void;
      previousStep: () => void;
      skipTutorial: () => void;
    }) => unknown,
  ) =>
    selector({
      activeFlow: tutorialState.activeFlow,
      currentStepIndex: tutorialState.currentStepIndex,
      isVisible: tutorialState.isVisible,
      onboardingCompleted: tutorialState.onboardingCompleted,
      startTutorial: jest.fn(),
      nextStep: jest.fn(),
      previousStep: jest.fn(),
      skipTutorial: jest.fn(),
    }),
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
}));

jest.mock('../src/services/GoogleTasksSyncService', () => ({
  __esModule: true,
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
    warn: jest.fn(),
  },
}));

jest.mock('../src/components/brain-dump', () => {
  const { Pressable, Text, View } = require('react-native');
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
    IntegrationPanel: () => <Text>INTEGRATIONS</Text>,
  };
});

jest.mock('../src/components/tutorial/TutorialBubble', () => ({
  __esModule: true,
  TutorialBubble: () => null,
}));

describe('Task model split regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTaskStore.setState({ tasks: [], _hasHydrated: true });
  });

  it('keeps capture-created tasks visible from the Brain Dump task surface', async () => {
    const taskTitle = 'Captured store task';

    render(<TaskCaptureMode onSuccess={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('capture-task-input'), taskTitle);
    fireEvent.press(screen.getByText('ADD TASK'));

    render(<CaptureBubble />);

    await waitFor(() => {
      expect(screen.getByTestId('capture-bubble-badge')).toHaveTextContent('1');
    });

    render(<BrainDumpScreen />);

    await waitFor(() => {
      expect(screen.getByText('BRAIN_DUMP')).toBeTruthy();
    });
    expect(screen.getByText(taskTitle)).toBeTruthy();
  }, 15000);
});
