import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';

/**
 * TutorialStep interface - defines a single step in a tutorial flow
 */
export interface TutorialStep {
  /** Unique identifier for this step */
  id: string;
  /** Display title - short, punchy headline */
  title: string;
  /** The clinical/ADHD benefit - explains WHY this feature matters */
  whyText: string;
  /** The actionable instruction - explains WHAT to do */
  howText: string;
  /** Optional: Icon name from MaterialCommunityIcons */
  iconName?: string;
}

/**
 * TutorialFlow interface - defines a complete tutorial sequence
 */
export interface TutorialFlow {
  id: string;
  name: string;
  steps: TutorialStep[];
}

/**
 * Brain Dump onboarding flow - the first tutorial users see
 */
export const brainDumpOnboardingFlow: TutorialFlow = {
  id: 'brain-dump-onboarding',
  name: 'Brain Dump Introduction',
  steps: [
    {
      id: 'brain-dump-welcome',
      title: 'Brain Dump: Clear the Noise',
      whyText:
        'Racing thoughts drain your focus. Getting them out of your head and into the app frees up mental space.',
      howText:
        'This is your capture zone. Tap the microphone or type to dump everything on your mind.',
      iconName: 'brain',
    },
    {
      id: 'brain-dump-capture',
      title: 'Capture Everything',
      whyText:
        'ADHD brains are great at generating ideas, not holding them. Externalizing prevents mental overflow.',
      howText:
        "Speak or type freely. Don't organize yet - just get it all out. You'll sort later.",
      iconName: 'microphone',
    },
    {
      id: 'brain-dump-sort',
      title: 'Sort with AI',
      whyText:
        'Decision fatigue is real. Let AI categorize so you can focus on doing, not organizing.',
      howText:
        'When you\'re done dumping, tap "Sort" and AI will organize your thoughts into actionable tasks.',
      iconName: 'sort-variant',
    },
    {
      id: 'brain-dump-complete',
      title: "You're Ready",
      whyText: 'Progress, not perfection. Even capturing one thought is a win.',
      howText:
        'Start dumping whenever your mind feels cluttered. Use the TOUR button here anytime you want to replay this guide.',
      iconName: 'check-circle',
    },
  ],
};

interface TutorialState {
  // Persistence state
  /** Whether the user has completed or skipped the onboarding */
  onboardingCompleted: boolean;
  /** Set of completed tutorial flow IDs */
  completedFlows: string[];
  /** Timestamp of last tutorial interaction */
  lastTutorialAt: number | null;

  // Transient UI state
  /** Currently active tutorial flow */
  activeFlow: TutorialFlow | null;
  /** Current step index within the active flow */
  currentStepIndex: number;
  /** Whether the tutorial overlay is visible */
  isVisible: boolean;

  // Actions
  startTutorial: (flow: TutorialFlow) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorials: () => void;
  hasCompletedFlow: (flowId: string) => boolean;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // Persistence defaults
      onboardingCompleted: false,
      completedFlows: [],
      lastTutorialAt: null,

      // Transient defaults
      activeFlow: null,
      currentStepIndex: 0,
      isVisible: false,

      startTutorial: (flow: TutorialFlow) => {
        UXMetricsService.track('tutorial_started', {
          flowId: flow.id,
          flowName: flow.name,
          stepCount: flow.steps.length,
        });

        set({
          activeFlow: flow,
          currentStepIndex: 0,
          isVisible: true,
        });
      },

      nextStep: () => {
        const { activeFlow, currentStepIndex } = get();
        if (!activeFlow) {
          return;
        }

        const currentStep = activeFlow.steps[currentStepIndex];
        const nextIndex = currentStepIndex + 1;

        // Track step completion
        UXMetricsService.track('tutorial_step_completed', {
          flowId: activeFlow.id,
          stepId: currentStep.id,
          stepIndex: currentStepIndex,
          stepTitle: currentStep.title,
        });

        if (nextIndex < activeFlow.steps.length) {
          set({ currentStepIndex: nextIndex });
        } else {
          // Complete the tutorial
          get().completeTutorial();
        }
      },

      previousStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTutorial: () => {
        const { activeFlow, currentStepIndex } = get();
        if (!activeFlow) {
          return;
        }

        const currentStep = activeFlow.steps[currentStepIndex];

        UXMetricsService.track('tutorial_skipped', {
          flowId: activeFlow.id,
          atStepId: currentStep?.id,
          atStepIndex: currentStepIndex,
          stepTitle: currentStep?.title,
        });

        set({
          isVisible: false,
          activeFlow: null,
          currentStepIndex: 0,
          onboardingCompleted: true,
          lastTutorialAt: Date.now(),
        });
      },

      completeTutorial: () => {
        const { activeFlow, completedFlows } = get();
        if (!activeFlow) {
          return;
        }

        const updatedCompletedFlows = [...completedFlows];
        if (!updatedCompletedFlows.includes(activeFlow.id)) {
          updatedCompletedFlows.push(activeFlow.id);
        }

        UXMetricsService.track('tutorial_completed', {
          flowId: activeFlow.id,
          flowName: activeFlow.name,
        });

        set({
          isVisible: false,
          activeFlow: null,
          currentStepIndex: 0,
          onboardingCompleted: true,
          completedFlows: updatedCompletedFlows,
          lastTutorialAt: Date.now(),
        });
      },

      resetTutorials: () => {
        UXMetricsService.track('tutorial_reset', {});

        set({
          onboardingCompleted: false,
          completedFlows: [],
          lastTutorialAt: null,
          isVisible: false,
          activeFlow: null,
          currentStepIndex: 0,
        });
      },

      hasCompletedFlow: (flowId: string) => {
        return get().completedFlows.includes(flowId);
      },
    }),
    {
      name: 'spark-tutorial-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist these fields
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
        completedFlows: state.completedFlows,
        lastTutorialAt: state.lastTutorialAt,
      }),
    },
  ),
);

export default useTutorialStore;
