import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import StorageService from '../services/StorageService';
import { useBrainDumpItems, DumpItem } from './useBrainDumpItems';
import {
  useBrainDumpRecording,
  RecordingState,
  RecordingResult,
} from './useBrainDumpRecording';
import { useBrainDumpSorting } from './useBrainDumpSorting';
import type { SortedItem } from '../services/AISortService';

export type { DumpItem } from './useBrainDumpItems';
export type { RecordingState } from './useBrainDumpRecording';
export type { SortedItem } from '../services/AISortService';
export { CATEGORY_ORDER } from './useBrainDumpSorting';

interface UseBrainDumpReturn {
  // State
  items: DumpItem[];
  recordingState: RecordingState;
  recordingError: string | null;
  isSorting: boolean;
  isLoading: boolean;
  sortingError: string | null;
  sortedItems: SortedItem[];
  googleAuthRequired: boolean;
  isConnectingGoogle: boolean;
  showGuide: boolean;
  guideDismissed: boolean;
  groupedSortedItems: Array<{ category: string; items: SortedItem[] }>;

  // Actions
  addItem: (text: string) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
  handleRecordPress: () => Promise<void>;
  handleAISort: () => Promise<void>;
  handleConnectGoogle: () => Promise<void>;
  dismissGuide: () => Promise<void>;
  getPriorityStyle: (priority: SortedItem['priority']) => object;
}

export const useBrainDump = (autoRecord?: boolean): UseBrainDumpReturn => {
  const [showGuide, setShowGuide] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(true);
  const hasAutoRecorded = useRef(false);

  // Initialize layout animation on Android
  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Load guide state on mount
  useEffect(() => {
    const loadGuideState = async () => {
      const guideState = await StorageService.getJSON<{
        brainDumpDismissed?: boolean;
      }>(StorageService.STORAGE_KEYS.firstSuccessGuideState);
      setGuideDismissed(!!guideState?.brainDumpDismissed);
    };
    loadGuideState();
  }, []);

  // Items management hook
  const {
    items,
    isLoading,
    addItem: addItemBase,
    deleteItem,
    clearAll,
    loadItems,
  } = useBrainDumpItems({
    guideDismissed,
    onFirstItemAdded: useCallback(() => {
      setShowGuide(true);
    }, []),
  });

  // Sorting and sync hook
  const {
    sortedItems,
    isSorting,
    sortingError,
    googleAuthRequired,
    isConnectingGoogle,
    groupedSortedItems,
    handleAISort: handleAISortBase,
    handleConnectGoogle,
    clearSortedItems,
    clearSortingError,
    getPriorityStyle,
  } = useBrainDumpSorting();

  // Recording hook
  const {
    recordingState,
    recordingError,
    handleRecordPress: handleRecordPressBase,
    clearRecordingError,
  } = useBrainDumpRecording({
    onTranscriptionSuccess: useCallback(
      async ({ text, audioPath, sortItems }: RecordingResult) => {
        // Add the transcribed item
        addItemBase(text, 'audio', audioPath);

        // Clear any previous sorted items and errors when new content is added
        clearSortedItems();
        clearSortingError();

        // Run sorting pipeline if we have sortable items
        if (sortItems.length > 0) {
          try {
            await handleAISortBase(sortItems);
          } catch (error) {
            // Error is handled by the sorting hook
          }
        }
      },
      [addItemBase, clearSortedItems, clearSortingError, handleAISortBase],
    ),
    onTranscriptionError: useCallback(
      (_error: string, audioPath: string) => {
        // Add a placeholder item for failed transcription
        addItemBase('[Voice Note: Transcription Failed]', 'audio', audioPath);
      },
      [addItemBase],
    ),
  });

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Auto-record on mount if requested
  useEffect(() => {
    if (!autoRecord || hasAutoRecorded.current) {
      return;
    }
    hasAutoRecorded.current = true;
    // Trigger recording immediately
    handleRecordPressBase();
  }, [autoRecord, handleRecordPressBase]);

  // Clear sorted items when items change (new item added or deleted)
  useEffect(() => {
    clearSortedItems();
    clearSortingError();
  }, [items.length, clearSortedItems, clearSortingError]);

  const dismissGuide = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowGuide(false);
    setGuideDismissed(true);
    const currentState =
      (await StorageService.getJSON<Record<string, boolean>>(
        StorageService.STORAGE_KEYS.firstSuccessGuideState,
      )) ?? {};
    await StorageService.setJSON(
      StorageService.STORAGE_KEYS.firstSuccessGuideState,
      { ...currentState, brainDumpDismissed: true },
    );
  }, []);

  const addItem = useCallback(
    (text: string) => {
      addItemBase(text, 'text');
    },
    [addItemBase],
  );

  const handleAISort = useCallback(async () => {
    await handleAISortBase(items.map((item) => item.text));
  }, [handleAISortBase, items]);

  const handleRecordPress = useCallback(async () => {
    clearRecordingError();
    await handleRecordPressBase();
  }, [clearRecordingError, handleRecordPressBase]);

  return {
    items,
    recordingState,
    recordingError,
    isSorting,
    isLoading,
    sortingError,
    sortedItems,
    googleAuthRequired,
    isConnectingGoogle,
    showGuide,
    guideDismissed,
    groupedSortedItems,
    addItem,
    deleteItem,
    clearAll,
    handleRecordPress,
    handleAISort,
    handleConnectGoogle,
    dismissGuide,
    getPriorityStyle,
  };
};

export default useBrainDump;
