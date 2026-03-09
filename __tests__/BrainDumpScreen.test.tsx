/* eslint-disable no-console */
import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import BrainDumpScreen from '../src/screens/BrainDumpScreen';

type MockTutorialStep = { title: string };
type MockTutorialFlow = { id: string; steps: MockTutorialStep[] };

const mockBrainDumpFlow: MockTutorialFlow = {
  id: 'brain-dump-onboarding',
  steps: [
    { title: 'Brain Dump: Clear the Noise' },
    { title: 'Capture Everything' },
  ],
};

const tutorialState = {
  activeFlow: null as MockTutorialFlow | null,
  currentStepIndex: 0,
  isVisible: false,
  onboardingCompleted: false,
};

const resetTutorialState = () => {
  tutorialState.activeFlow = null;
  tutorialState.currentStepIndex = 0;
  tutorialState.isVisible = false;
  tutorialState.onboardingCompleted = false;
};

const startTutorial = (flow: MockTutorialFlow) => {
  tutorialState.activeFlow = flow;
  tutorialState.currentStepIndex = 0;
  tutorialState.isVisible = true;
};

const nextStep = () => {
  if (!tutorialState.activeFlow) {
    return;
  }
  const nextIndex = tutorialState.currentStepIndex + 1;
  if (nextIndex < tutorialState.activeFlow.steps.length) {
    tutorialState.currentStepIndex = nextIndex;
    return;
  }
  tutorialState.activeFlow = null;
  tutorialState.currentStepIndex = 0;
  tutorialState.isVisible = false;
  tutorialState.onboardingCompleted = true;
};

const previousStep = () => {
  tutorialState.currentStepIndex = Math.max(
    0,
    tutorialState.currentStepIndex - 1,
  );
};

const skipTutorial = () => {
  tutorialState.activeFlow = null;
  tutorialState.currentStepIndex = 0;
  tutorialState.isVisible = false;
  tutorialState.onboardingCompleted = true;
};

jest.mock('@react-navigation/native', () => ({
  __esModule: true,
  useRoute: () => ({ params: {} }),
}));

// PlatformUtils — use dynamic getter pattern to allow per-test overrides
jest.mock('../src/utils/PlatformUtils', () => {
  const state = { isWeb: false, isAndroid: false, isIOS: false };
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
      startTutorial,
      nextStep,
      previousStep,
      skipTutorial,
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
    DumpItem: undefined,
    RecordingState: undefined,
  };
});

jest.mock('../src/components/tutorial/TutorialBubble', () => {
  const { Pressable, Text, View } = require('react-native');
  return {
    TutorialBubble: ({
      step,
      isFirstStep,
      isLastStep,
      onNext,
      onPrevious,
      onSkip,
    }: {
      step: { title: string };
      isFirstStep: boolean;
      isLastStep: boolean;
      onNext: () => void;
      onPrevious: () => void;
      onSkip: () => void;
    }) => (
      <View testID="tutorial-bubble-mock">
        <Text>{step.title}</Text>
        {!isFirstStep && (
          <Pressable testID="tutorial-previous-button" onPress={onPrevious}>
            <Text>Previous</Text>
          </Pressable>
        )}
        <Pressable testID="tutorial-next-button" onPress={onNext}>
          <Text>{isLastStep ? 'Finish' : 'Next'}</Text>
        </Pressable>
        <Pressable testID="tutorial-skip-button" onPress={onSkip}>
          <Text>Skip Tutorial</Text>
        </Pressable>
      </View>
    ),
  };
});

describe('BrainDumpScreen', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;
  const originalConsoleError = console.error;

  beforeEach(() => {
    resetTutorialState();
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((...args: unknown[]) => {
        const [firstArg] = args;
        if (
          typeof firstArg === 'string' &&
          firstArg.includes('not wrapped in act')
        ) {
          return;
        }

        originalConsoleError(...args);
      });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders brain dump shell UI', async () => {
    render(<BrainDumpScreen />);

    expect(screen.getByText('BRAIN_DUMP')).toBeTruthy();
    await waitFor(
      () => {
        expect(screen.getByText('ACTION_BAR')).toBeTruthy();
      },
      { timeout: 10000 },
    );
    expect(screen.getByText('_AWAITING_INPUT')).toBeTruthy();
  }, 10000);

  it('renders tutorial state and advances through the mocked flow', async () => {
    startTutorial(mockBrainDumpFlow);

    const view = render(<BrainDumpScreen />);
    expect(screen.getByTestId('tutorial-overlay')).toBeTruthy();
    expect(screen.getByText('Brain Dump: Clear the Noise')).toBeTruthy();

    fireEvent.press(screen.getByTestId('tutorial-next-button'));
    view.rerender(<BrainDumpScreen />);

    expect(screen.getByText('Capture Everything')).toBeTruthy();

    fireEvent.press(screen.getByTestId('tutorial-skip-button'));
    view.rerender(<BrainDumpScreen />);

    expect(screen.queryByTestId('tutorial-overlay')).toBeNull();
  });
});
