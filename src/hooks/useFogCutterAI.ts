import { useState, useCallback } from 'react';
import { LayoutAnimation } from 'react-native';
import FogCutterAIService, { MicroStep } from '../services/FogCutterAIService';
import UXMetricsService from '../services/UXMetricsService';
import { LoggerService } from '../services/LoggerService';

interface UseFogCutterAIReturn {
  isAiLoading: boolean;
  handleAiBreakdown: (task: string) => Promise<void>;
  clearAiLoading: () => void;
}

interface UseFogCutterAIOptions {
  onStepsGenerated?: (steps: string[]) => void;
}

export const useFogCutterAI = ({
  onStepsGenerated,
}: UseFogCutterAIOptions = {}): UseFogCutterAIReturn => {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiBreakdown = useCallback(
    async (task: string) => {
      if (!task.trim() || isAiLoading) {
        return;
      }

      setIsAiLoading(true);
      UXMetricsService.track('fog_cutter_ai_breakdown_requested', {
        taskLength: task.length,
      });

      try {
        const steps: MicroStep[] =
          await FogCutterAIService.generateMicroSteps(task);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const stepTexts = steps.map((s) => s.text);
        onStepsGenerated?.(stepTexts);

        if (steps.length > 0) {
          UXMetricsService.track('fog_cutter_ai_breakdown_success', {
            stepCount: steps.length,
          });
        }
      } catch (error) {
        LoggerService.error({
          service: 'FogCutterAI',
          operation: 'generateMicroSteps',
          message: 'AI breakdown failed',
          error,
        });
      } finally {
        setIsAiLoading(false);
      }
    },
    [isAiLoading, onStepsGenerated],
  );

  const clearAiLoading = useCallback(() => {
    setIsAiLoading(false);
  }, []);

  return {
    isAiLoading,
    handleAiBreakdown,
    clearAiLoading,
  };
};

export default useFogCutterAI;
