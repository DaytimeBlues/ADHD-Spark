import { useState, useCallback, useRef } from 'react';
import { LayoutAnimation, Platform } from 'react-native';
import RecordingService from '../services/RecordingService';

import PlaudService from '../services/PlaudService';
import UXMetricsService from '../services/UXMetricsService';

export type RecordingState = 'idle' | 'recording' | 'processing';

const MAX_SORT_INPUT_ITEMS = 50;

const transcriptionToSortItems = (transcription: string): string[] => {
  return transcription
    .split(/\r?\n|[.;]+/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, MAX_SORT_INPUT_ITEMS);
};

export interface RecordingResult {
  text: string;
  audioPath: string;
  sortItems: string[];
}

interface UseBrainDumpRecordingOptions {
  onTranscriptionSuccess?: (result: RecordingResult) => void;
  onTranscriptionError?: (error: string, audioPath: string) => void;
}

interface UseBrainDumpRecordingReturn {
  recordingState: RecordingState;
  recordingError: string | null;
  handleRecordPress: () => Promise<void>;
  clearRecordingError: () => void;
}

export const useBrainDumpRecording = ({
  onTranscriptionSuccess,
  onTranscriptionError,
}: UseBrainDumpRecordingOptions): UseBrainDumpRecordingReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const previousErrorRef = useRef(false);

  const clearRecordingError = useCallback(() => {
    setRecordingError(null);
  }, []);

  const handleRecordPress = useCallback(async () => {
    if (recordingState === 'idle') {
      previousErrorRef.current = !!recordingError;
    }
    setRecordingError(null);

    if (recordingState === 'idle') {
      const started = await RecordingService.startRecording();
      if (started) {
        setRecordingState('recording');
      } else {
        setRecordingError(
          'Could not start recording. Check microphone permissions.',
        );
      }
    } else if (recordingState === 'recording') {
      setRecordingState('processing');
      const result = await RecordingService.stopRecording();

      if (!result) {
        setRecordingError('Recording failed.');
        setRecordingState('idle');
        return;
      }

      const transcription = await PlaudService.transcribe(result.uri);

      if (transcription.success && transcription.transcription) {
        if (previousErrorRef.current) {
          UXMetricsService.track('brain_dump_recovery_after_error');
          previousErrorRef.current = false;
        }
        if (Platform.OS !== 'web') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }

        const sourceItems = transcriptionToSortItems(
          transcription.transcription,
        );

        onTranscriptionSuccess?.({
          text: transcription.transcription,
          audioPath: result.uri,
          sortItems: sourceItems,
        });
      } else {
        setRecordingError(
          transcription.error || 'Transcription failed. Audio saved locally.',
        );
        onTranscriptionError?.(
          transcription.error || 'Transcription failed',
          result.uri,
        );
      }

      setRecordingState('idle');
    }
  }, [
    recordingError,
    recordingState,
    onTranscriptionSuccess,
    onTranscriptionError,
  ]);

  return {
    recordingState,
    recordingError,
    handleRecordPress,
    clearRecordingError,
  };
};

export default useBrainDumpRecording;
