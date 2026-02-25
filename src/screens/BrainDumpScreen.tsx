import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import StorageService from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';
import RecordingService from '../services/RecordingService';
import PlaudService, { GoogleTasksSyncService } from '../services/PlaudService';
import OverlayService from '../services/OverlayService';
import AISortService, { SortedItem } from '../services/AISortService';
import { generateId } from '../utils/helpers';
import { normalizeMicroSteps } from '../utils/fogCutter';
import { LinearButton } from '../components/ui/LinearButton';
import { EmptyState } from '../components/ui/EmptyState';
import { CosmicBackground, GlowCard } from '../ui/cosmic';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';

const HIT_SLOP = {
  top: Tokens.spacing[4],
  bottom: Tokens.spacing[4],
  left: Tokens.spacing[4],
  right: Tokens.spacing[4],
};

const PERSIST_DEBOUNCE_MS = 300;
const OVERLAY_COUNT_DEBOUNCE_MS = 250;
const MAX_SORT_INPUT_ITEMS = 50;

const CATEGORY_ORDER: Array<SortedItem['category']> = [
  'task',
  'event',
  'reminder',
  'worry',
  'thought',
  'idea',
];

interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
  source: 'text' | 'audio'; // Track origin
  audioPath?: string; // Optional local file path
}

interface StoredFogCutterTask {
  id: string;
  text: string;
  completed: boolean;
  microSteps: Array<{ id: string; text: string; status: string }>;
}

type RecordingState = 'idle' | 'recording' | 'processing';

type BrainDumpRouteParams = {
  autoRecord?: boolean;
};

type BrainDumpRoute = RouteProp<Record<'Tasks', BrainDumpRouteParams>, 'Tasks'>;

const transcriptionToSortItems = (transcription: string): string[] => {
  return transcription
    .split(/\r?\n|[.;]+/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, MAX_SORT_INPUT_ITEMS);
};

const toFogCutterTask = (item: SortedItem): StoredFogCutterTask | null => {
  if (
    item.category !== 'task' &&
    item.category !== 'reminder' &&
    item.category !== 'event'
  ) {
    return null;
  }

  const title = item.text.trim();
  if (!title) {
    return null;
  }

  const stepHints: string[] = [
    'Open this task and start with a 2-minute first step',
  ];
  if (item.dueDate) {
    stepHints.push(`Check due date: ${item.dueDate}`);
  }
  if (item.start) {
    stepHints.push(`Schedule window starts: ${item.start}`);
  }

  return {
    id: generateId(),
    text: title,
    completed: false,
    microSteps: normalizeMicroSteps(stepHints),
  };
};

const BrainDumpScreen = () => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);
  const route = useRoute<BrainDumpRoute>();
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortingError, setSortingError] = useState<string | null>(null);
  const [sortedItems, setSortedItems] = useState<SortedItem[]>([]);
  const [googleAuthRequired, setGoogleAuthRequired] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(true);
  const hasAutoRecorded = useRef(false);
  const previousErrorRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastOverlayCountRef = useRef<number>(0);
  const inputRef = useRef<TextInput>(null);

  const loadItems = async () => {
    try {
      const [storedItems, guideState] = await Promise.all([
        StorageService.getJSON<DumpItem[]>(
          StorageService.STORAGE_KEYS.brainDump,
        ),
        StorageService.getJSON<{ brainDumpDismissed?: boolean }>(
          StorageService.STORAGE_KEYS.firstSuccessGuideState,
        ),
      ]);

      if (guideState) {
        setGuideDismissed(!!guideState.brainDumpDismissed);
      } else {
        setGuideDismissed(false);
      }

      if (storedItems && Array.isArray(storedItems)) {
        const normalized = storedItems.filter((item) => {
          return Boolean(item?.id && item?.text && item?.createdAt);
        });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setItems(normalized);
      }
    } catch (error) {
      console.error('Failed to load items', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    loadItems();
  }, []);

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(
        StorageService.STORAGE_KEYS.brainDump,
        items,
      ).catch((error) => {
        console.error('Failed to persist brain dump items:', error);
      });
    }, PERSIST_DEBOUNCE_MS);

    if (items.length !== lastOverlayCountRef.current) {
      if (overlayCountTimerRef.current) {
        clearTimeout(overlayCountTimerRef.current);
      }
      overlayCountTimerRef.current = setTimeout(() => {
        OverlayService.updateCount(items.length);
        lastOverlayCountRef.current = items.length;
      }, OVERLAY_COUNT_DEBOUNCE_MS);
    }

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
      if (overlayCountTimerRef.current) {
        clearTimeout(overlayCountTimerRef.current);
      }
    };
  }, [items]);

  const dismissGuide = async () => {
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
  };

  const addItem = () => {
    if (input.trim()) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const newItem: DumpItem = {
        id: generateId(),
        text: input.trim(),
        createdAt: new Date().toISOString(),
        source: 'text',
      };
      setItems((prevItems) => {
        const next = [newItem, ...prevItems];
        // Track first item added if guide not dismissed
        if (!guideDismissed && !showGuide) {
          UXMetricsService.track('brain_dump_first_item_added');
          setShowGuide(true);
        }
        return next;
      });
      setInput('');
      setSortedItems([]);
      setSortingError(null);
    }
  };

  const saveSortedItemsToFogCutter = useCallback(
    async (nextSortedItems: SortedItem[]): Promise<number> => {
      const existingTasks =
        (await StorageService.getJSON<StoredFogCutterTask[]>(
          StorageService.STORAGE_KEYS.tasks,
        )) ?? [];

      const existingTextSet = new Set(
        existingTasks.map((existingTask) =>
          existingTask.text.trim().toLowerCase(),
        ),
      );

      const newTasks: StoredFogCutterTask[] = [];
      nextSortedItems.forEach((item) => {
        const task = toFogCutterTask(item);
        if (!task) {
          return;
        }

        const key = task.text.trim().toLowerCase();
        if (existingTextSet.has(key)) {
          return;
        }

        existingTextSet.add(key);
        newTasks.push(task);
      });

      if (newTasks.length === 0) {
        return 0;
      }

      await StorageService.setJSON(StorageService.STORAGE_KEYS.tasks, [
        ...existingTasks,
        ...newTasks,
      ]);
      return newTasks.length;
    },
    [],
  );

  const runSortAndSyncPipeline = useCallback(
    async (sourceItems: string[]) => {
      if (sourceItems.length === 0) {
        return;
      }

      const sorted = await AISortService.sortItems(sourceItems);
      setSortedItems(sorted);

      const [createdTaskCount, exportResult] = await Promise.all([
        saveSortedItemsToFogCutter(sorted),
        GoogleTasksSyncService.syncSortedItemsToGoogle(sorted),
      ]);

      if (exportResult.authRequired) {
        setGoogleAuthRequired(true);
        if (Platform.OS === 'web') {
          setSortingError(
            'Google sign-in is not available on web yet. Please use the mobile app to sync with Google Tasks.',
          );
        } else {
          setSortingError(
            exportResult.errorMessage ||
              'Google sign-in required to sync Tasks and Calendar exports.',
          );
        }
      } else if (exportResult.errorMessage) {
        setGoogleAuthRequired(false);
        setSortingError(exportResult.errorMessage);
      } else if (
        createdTaskCount > 0 ||
        exportResult.createdTasks > 0 ||
        exportResult.createdEvents > 0
      ) {
        setSortingError(null);
        setGoogleAuthRequired(false);
        AccessibilityInfo.announceForAccessibility(
          'Tasks synced and suggestions saved.',
        );
      }
    },
    [saveSortedItemsToFogCutter],
  );

  const handleConnectGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      setSortingError(
        'Google sign-in is not available on web yet. Please use the mobile app to sync with Google Tasks.',
      );
      return;
    }

    setIsConnectingGoogle(true);
    try {
      const success = await GoogleTasksSyncService.signInInteractive();
      if (!success) {
        setSortingError('Google sign-in failed. Please try again.');
        return;
      }

      if (sortedItems.length === 0) {
        setGoogleAuthRequired(false);
        setSortingError(null);
        return;
      }

      const exportResult =
        await GoogleTasksSyncService.syncSortedItemsToGoogle(sortedItems);

      if (exportResult.authRequired) {
        setGoogleAuthRequired(true);
        setSortingError(
          exportResult.errorMessage ||
            'Google sign-in required to sync Tasks and Calendar exports.',
        );
        return;
      }

      if (exportResult.errorMessage) {
        setGoogleAuthRequired(false);
        setSortingError(exportResult.errorMessage);
        return;
      }

      setGoogleAuthRequired(false);
      setSortingError(null);
      AccessibilityInfo.announceForAccessibility(
        'Tasks synced and suggestions saved.',
      );
    } finally {
      setIsConnectingGoogle(false);
    }
  }, [sortedItems]);

  // Handle recording toggle
  const handleRecordPress = useCallback(async () => {
    if (recordingState === 'idle') {
      previousErrorRef.current = !!recordingError;
    }
    setRecordingError(null);

    if (recordingState === 'idle') {
      // Start recording
      const started = await RecordingService.startRecording();
      if (started) {
        setRecordingState('recording');
      } else {
        setRecordingError(
          'Could not start recording. Check microphone permissions.',
        );
      }
    } else if (recordingState === 'recording') {
      // Stop recording and process
      setRecordingState('processing');
      const result = await RecordingService.stopRecording();

      if (!result) {
        setRecordingError('Recording failed.');
        setRecordingState('idle');
        return;
      }

      // Send to Plaud for transcription
      const transcription = await PlaudService.transcribe(result.uri);

      if (transcription.success && transcription.transcription) {
        if (previousErrorRef.current) {
          UXMetricsService.track('brain_dump_recovery_after_error');
          previousErrorRef.current = false;
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newItem: DumpItem = {
          id: generateId(),
          text: transcription.transcription,
          createdAt: new Date().toISOString(),
          source: 'audio',
          audioPath: result.uri,
        };
        setItems((prevItems) => {
          const next = [newItem, ...prevItems];
          if (!guideDismissed && !showGuide) {
            UXMetricsService.track('brain_dump_first_item_added');
            setShowGuide(true);
          }
          return next;
        });

        const sourceItems = transcriptionToSortItems(
          transcription.transcription,
        );
        if (sourceItems.length > 0) {
          try {
            await runSortAndSyncPipeline(sourceItems);
            setSortingError(null);
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Failed to sync transcription suggestions.';
            setSortingError(message);
          }
        }
      } else {
        setRecordingError(
          transcription.error || 'Transcription failed. Audio saved locally.',
        );

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newItem: DumpItem = {
          id: generateId(),
          text: '[Voice Note: Transcription Failed]',
          createdAt: new Date().toISOString(),
          source: 'audio',
          audioPath: result.uri,
        };
        setItems((prevItems) => [newItem, ...prevItems]);
      }

      setRecordingState('idle');
    }
  }, [
    guideDismissed,
    recordingError,
    recordingState,
    runSortAndSyncPipeline,
    showGuide,
  ]);

  useEffect(() => {
    if (!route.params?.autoRecord || hasAutoRecorded.current) {
      return;
    }

    hasAutoRecorded.current = true;
    handleRecordPress();
  }, [handleRecordPress, route.params?.autoRecord]);

  const deleteItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setSortedItems([]);
    setSortingError(null);
  };

  const clearAll = () => {
    const clearItems = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setItems([]);
      setSortedItems([]);
      setSortingError(null);
      AccessibilityInfo.announceForAccessibility('All items cleared.');
    };

    Alert.alert(
      'CLEAR_DATA?',
      'IRREVERSIBLE_ACTION.',
      [
        { text: 'ABORT', style: 'cancel' },
        { text: 'CONFIRM', style: 'destructive', onPress: clearItems },
      ],
      { cancelable: true },
    );
  };

  const handleAISort = async () => {
    setSortingError(null);
    setIsSorting(true);

    try {
      await runSortAndSyncPipeline(items.map((item) => item.text));
      AccessibilityInfo.announceForAccessibility('AI suggestions updated.');
    } catch (error) {
      setSortingError(
        error instanceof Error
          ? error.message
          : 'AI sort is currently unavailable.',
      );
      setSortedItems([]);
    } finally {
      setIsSorting(false);
    }
  };

  const groupedSortedItems = useMemo(() => {
    const grouped = new Map<string, SortedItem[]>();
    sortedItems.forEach((item) => {
      const existing = grouped.get(item.category) ?? [];
      existing.push(item);
      grouped.set(item.category, existing);
    });

    return CATEGORY_ORDER.map((category) => ({
      category,
      items: grouped.get(category) ?? [],
    })).filter((entry) => entry.items.length > 0);
  }, [sortedItems]);

  const getPriorityStyle = (priority: SortedItem['priority']) => {
    if (priority === 'high') {
      return styles.priorityHigh;
    }
    if (priority === 'medium') {
      return styles.priorityMedium;
    }
    return styles.priorityLow;
  };

  const renderItem = ({ item }: { item: DumpItem }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
      <Pressable
        onPress={() => deleteItem(item.id)}
        accessibilityRole="button"
        accessibilityLabel="Delete brain dump item"
        accessibilityHint="Removes this item from the list"
        style={({
          pressed,
          hovered,
        }: {
          pressed: boolean;
          hovered?: boolean;
        }) => [
          styles.deleteButton,
          hovered && styles.deleteButtonHovered,
          pressed && styles.deleteButtonPressed,
        ]}
        hitSlop={HIT_SLOP}
      >
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
  );

  const content = (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>BRAIN_DUMP</Text>
            <View style={styles.headerLine} />
          </View>

          {isCosmic ? (
            <GlowCard style={styles.rationaleCard} testID="rationale-card">
              <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
              <Text style={styles.rationaleText}>
                Cognitive offloading is essential for ADHD working memory.
                Externalizing thoughts reduces mental clutter and prevents
                thought chasing. CBT/CADDI uses this to create space for
                prioritization and prevent overwhelm from competing demands.
              </Text>
            </GlowCard>
          ) : (
            <View style={styles.rationaleCard}>
              <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
              <Text style={styles.rationaleText}>
                Cognitive offloading is essential for ADHD working memory.
                Externalizing thoughts reduces mental clutter and prevents
                thought chasing. CBT/CADDI uses this to create space for
                prioritization and prevent overwhelm from competing demands.
              </Text>
            </View>
          )}

          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="> INPUT_DATA..."
                placeholderTextColor={Tokens.colors.text.placeholder}
                accessibilityLabel="Add a brain dump item"
                accessibilityHint="Type a thought and press Add"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={addItem}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                multiline={false}
                returnKeyType="done"
                blurOnSubmit
              />
            </View>
            <LinearButton
              title="+"
              onPress={addItem}
              size="lg"
              style={styles.addButton}
            />
          </View>

          {showGuide && (
            <View style={styles.guideBanner}>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>DATA_CAPTURED.</Text>
                <Text style={styles.guideText}>
                  NEXT: PROCESS_IN_FOG_CUTTER.
                </Text>
              </View>
              <Pressable
                onPress={dismissGuide}
                style={({ pressed }) => [
                  styles.guideButton,
                  pressed && styles.guideButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Dismiss guidance"
              >
                <Text style={styles.guideButtonText}>ACK</Text>
              </Pressable>
            </View>
          )}

          {/* Recording Button */}
          <View style={styles.recordSection}>
            <Pressable
              testID="brain-dump-record-toggle"
              onPress={handleRecordPress}
              disabled={recordingState === 'processing'}
              accessibilityRole="button"
              accessibilityLabel={
                recordingState === 'recording'
                  ? 'Stop recording'
                  : 'Start recording'
              }
              accessibilityHint="Records voice and converts it to a task item"
              style={({
                pressed,
                hovered,
              }: {
                pressed: boolean;
                hovered?: boolean;
              }) => [
                styles.recordButton,
                hovered && styles.recordButtonHovered,
                recordingState === 'recording' && styles.recordButtonActive,
                recordingState === 'processing' &&
                  styles.recordButtonProcessing,
                pressed && styles.recordButtonPressed,
              ]}
            >
              {recordingState === 'processing' ? (
                <ActivityIndicator
                  size="small"
                  color={Tokens.colors.text.primary}
                />
              ) : (
                <Text style={styles.recordIcon}>
                  {recordingState === 'recording' ? '■' : '●'}
                </Text>
              )}
              <Text style={styles.recordText}>
                {recordingState === 'idle' && 'VOICE_INPUT'}
                {recordingState === 'recording' && 'STOP_REC'}
                {recordingState === 'processing' && 'PROCESSING...'}
              </Text>
            </Pressable>
            {recordingError && (
              <Text style={styles.errorText}>{recordingError}</Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={Tokens.colors.brand[500]}
              />
              <Text style={styles.loadingText}>LOADING...</Text>
            </View>
          ) : items.length > 0 ? (
            <View style={styles.actionsBar}>
              <Text style={styles.countText}>{items.length} ITEMS</Text>
              <View style={styles.actionsRight}>
                <Pressable
                  testID="brain-dump-ai-sort"
                  onPress={handleAISort}
                  disabled={isSorting}
                  accessibilityRole="button"
                  accessibilityLabel="AI sort"
                  accessibilityHint="Sorts and groups items using AI suggestions"
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.actionButton,
                    hovered && styles.clearHovered,
                    pressed && styles.clearPressed,
                    isSorting && styles.actionButtonDisabled,
                  ]}
                >
                  <Text style={styles.aiSortText}>
                    {isSorting ? 'SORTING...' : 'AI_SORT'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={clearAll}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all items"
                  accessibilityHint="Opens a confirmation to remove all items"
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.actionButton,
                    hovered && styles.clearHovered,
                    pressed && styles.clearPressed,
                  ]}
                >
                  <Text style={styles.clearText}>CLEAR</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {sortingError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{sortingError}</Text>
              {googleAuthRequired && Platform.OS !== 'web' && (
                <Pressable
                  onPress={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.connectButton,
                    isConnectingGoogle && styles.connectButtonDisabled,
                    pressed && styles.connectButtonPressed,
                  ]}
                >
                  <Text style={styles.connectButtonText}>
                    {isConnectingGoogle ? 'CONNECTING...' : 'CONNECT GOOGLE'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {!isLoading &&
            groupedSortedItems.length > 0 &&
            (isCosmic ? (
              <GlowCard
                style={styles.sortedSection}
                testID="ai-analysis-section"
              >
                <Text style={styles.sortedTitle}>AI_ANALYSIS</Text>
                {groupedSortedItems.map(
                  ({ category, items: categoryItems }) => (
                    <View key={category} style={styles.sortedGroup}>
                      <Text style={styles.sortedCategory}>
                        {category.toUpperCase()}
                      </Text>
                      {categoryItems.map((item, index) => (
                        <View
                          key={`${category}-${index}-${item.text}`}
                          style={styles.sortedItemRow}
                        >
                          <Text style={styles.sortedItemText}>{item.text}</Text>
                          <View
                            style={[
                              styles.priorityBadge,
                              getPriorityStyle(item.priority),
                            ]}
                          >
                            <Text style={styles.priorityText}>
                              {item.priority}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ),
                )}
              </GlowCard>
            ) : (
              <View style={styles.sortedSection}>
                <Text style={styles.sortedTitle}>AI_ANALYSIS</Text>
                {groupedSortedItems.map(
                  ({ category, items: categoryItems }) => (
                    <View key={category} style={styles.sortedGroup}>
                      <Text style={styles.sortedCategory}>
                        {category.toUpperCase()}
                      </Text>
                      {categoryItems.map((item, index) => (
                        <View
                          key={`${category}-${index}-${item.text}`}
                          style={styles.sortedItemRow}
                        >
                          <Text style={styles.sortedItemText}>{item.text}</Text>
                          <View
                            style={[
                              styles.priorityBadge,
                              getPriorityStyle(item.priority),
                            ]}
                          >
                            <Text style={styles.priorityText}>
                              {item.priority}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ),
                )}
              </View>
            ))}

          {!isLoading && (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              windowSize={11}
              removeClippedSubviews={Platform.OS === 'android'}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState
                  icon="◌"
                  title="NULL_DATA."
                  primaryActionLabel="ADD FIRST ITEM"
                  onPrimaryAction={() => {
                    if (input.trim()) {
                      addItem();
                    } else {
                      inputRef.current?.focus();
                    }
                  }}
                  style={styles.emptyState}
                />
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );

  if (isCosmic) {
    return (
      <CosmicBackground variant="moon" dimmer>
        {content}
      </CosmicBackground>
    );
  }

  return content;
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic ? 'transparent' : Tokens.colors.neutral.darkest,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
      padding: Tokens.spacing[4], // Reduced
    },
    header: {
      marginBottom: Tokens.spacing[6],
      borderBottomWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
      paddingBottom: Tokens.spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: isCosmic ? 'Space Grotesk' : Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      ...(isCosmic
        ? Platform.select({
            web: {
              textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            },
          })
        : {}),
    },
    headerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.dark,
      marginLeft: Tokens.spacing[4],
    },
    rationaleCard: {
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.5)'
        : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.borderSubtle,
      padding: isCosmic ? 12 : Tokens.spacing[3],
      marginBottom: isCosmic ? 12 : Tokens.spacing[3],
      borderRadius: isCosmic ? 12 : Tokens.radii.none,
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.15),
              0 4px 24px rgba(7, 7, 18, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          })
        : {}),
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: isCosmic ? 4 : Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: 18,
      flexWrap: 'wrap',
    },
    // Input
    inputSection: {
      flexDirection: 'row',
      marginBottom: isCosmic ? 16 : Tokens.spacing[5],
      gap: isCosmic ? 8 : Tokens.spacing[2],
      alignItems: 'center',
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: isCosmic
        ? 'rgba(11, 16, 34, 0.8)'
        : Tokens.colors.neutral.darker,
      borderRadius: isCosmic ? 12 : Tokens.radii.none,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.25)'
        : Tokens.colors.neutral.border,
      minHeight: 48,
      justifyContent: 'center',
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(12px)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.03),
              0 4px 16px rgba(7, 7, 18, 0.3)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          })
        : Platform.select({
            web: { transition: 'all 0.2s ease' },
          })),
    },
    inputWrapperFocused: {
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.8)'
        : Tokens.colors.text.primary,
      ...(isCosmic
        ? Platform.select({
            web: {
              boxShadow: `
              0 0 0 2px rgba(139, 92, 246, 0.3),
              0 0 30px rgba(139, 92, 246, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
            },
          })
        : {}),
    },
    input: {
      paddingHorizontal: Tokens.spacing[3],
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      minHeight: 48,
      textAlignVertical: 'center',
      paddingVertical: 0,
      ...Platform.select({
        web: { outlineStyle: 'none' },
      }),
    },
    addButton: {
      minHeight: 48,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
    },
    // Actions
    actionsBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Tokens.spacing[4],
      paddingHorizontal: Tokens.spacing[2],
      alignItems: 'center',
    },
    actionsRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing[4],
    },
    actionButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
      ...Platform.select({
        web: { transition: 'all 0.2s ease' },
      }),
    },
    actionButtonDisabled: {
      opacity: 0.5,
      pointerEvents: 'none',
    },
    clearHovered: {
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.6)'
        : Tokens.colors.neutral.dark,
      ...(isCosmic
        ? Platform.select({
            web: {
              boxShadow:
                '0 0 0 1px rgba(139, 92, 246, 0.2), 0 0 16px rgba(139, 92, 246, 0.15), 0 8px 24px rgba(7, 7, 18, 0.5)',
            },
          })
        : {}),
    },
    clearPressed: {
      opacity: 0.7,
    },
    countText: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      letterSpacing: 1,
    },
    clearText: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      letterSpacing: 1,
    },
    aiSortText: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      letterSpacing: 1,
    },
    // Sorted Section
    sortedSection: {
      marginTop: isCosmic ? 12 : Tokens.spacing[3],
      marginBottom: isCosmic ? 16 : Tokens.spacing[5],
      padding: isCosmic ? 12 : Tokens.spacing[3],
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.4)'
        : Tokens.colors.neutral.darker,
      borderRadius: isCosmic ? 12 : Tokens.radii.none,
      borderWidth: 1,
      borderStyle: isCosmic ? 'solid' : 'dashed',
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.25)'
        : Tokens.colors.neutral.border,
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(24px) saturate(150%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.15),
              0 8px 32px rgba(7, 7, 18, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.06)
            `,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          })
        : {}),
    },
    sortedTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      marginBottom: isCosmic ? 8 : Tokens.spacing[3],
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    sortedGroup: {
      marginBottom: isCosmic ? 8 : Tokens.spacing[3],
    },
    sortedCategory: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: isCosmic ? 4 : Tokens.spacing[1],
      opacity: 0.9,
    },
    sortedItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 4,
      marginBottom: 0,
    },
    sortedItemText: {
      flex: 1,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: Tokens.type.sm * 1.5,
      marginRight: Tokens.spacing[3],
    },
    priorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 0,
      borderRadius: isCosmic ? 4 : Tokens.radii.none,
      minWidth: 40,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
    },
    priorityText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
    priorityHigh: {
      backgroundColor: Tokens.colors.brand[500],
      borderColor: Tokens.colors.brand[500],
    },
    priorityMedium: {
      backgroundColor: Tokens.colors.neutral.border,
    },
    priorityLow: {
      backgroundColor: Tokens.colors.neutral.dark,
    },
    listContent: {
      paddingBottom: 120,
    },
    item: {
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.4)'
        : Tokens.colors.neutral.darkest,
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
      paddingHorizontal: isCosmic ? 12 : Tokens.spacing[3],
      paddingVertical: isCosmic ? 8 : Tokens.spacing[2],
      marginBottom: isCosmic ? 6 : -1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.border,
      minHeight: isCosmic ? 40 : 48,
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(12px) saturate(150%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.1),
              0 4px 20px rgba(7, 7, 18, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.04)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          })
        : Platform.select({
            web: {
              transition: 'all 0.2s ease',
            },
          })),
    },
    itemText: {
      flex: 1,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      lineHeight: 16,
      marginRight: isCosmic ? 8 : Tokens.spacing[3],
    },
    deleteButton: {
      padding: 0,
      borderRadius: isCosmic ? 6 : Tokens.radii.none,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        web: { transition: 'all 0.2s ease' },
      }),
    },
    deleteButtonHovered: {
      backgroundColor: Tokens.colors.neutral.dark,
    },
    deleteButtonPressed: {
      backgroundColor: Tokens.colors.neutral.border,
    },
    deleteText: {
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      fontSize: Tokens.type.lg,
      fontWeight: '300',
      marginTop: -2,
    },
    // Empty
    emptyState: {
      marginTop: Tokens.spacing[12],
      opacity: 0.3,
    },
    // Recording

    recordSection: {
      alignItems: 'center',
      marginBottom: isCosmic ? 16 : Tokens.spacing[5],
    },
    recordButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.5)'
        : Tokens.colors.neutral.darkest,
      paddingHorizontal: isCosmic ? 12 : Tokens.spacing[3],
      paddingVertical: isCosmic ? 6 : Tokens.spacing[1],
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.3)'
        : Tokens.colors.neutral.border,
      minWidth: isCosmic ? 120 : 140,
      minHeight: isCosmic ? 36 : 48,
      justifyContent: 'center',
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.2),
              0 4px 24px rgba(7, 7, 18, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.08)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            },
          })
        : Platform.select({
            web: {
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            },
          })),
    },
    recordButtonHovered: {
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.6)'
        : Tokens.colors.text.primary,
      backgroundColor: isCosmic ? 'rgba(17, 26, 51, 0.7)' : undefined,
      ...(isCosmic
        ? Platform.select({
            web: {
              boxShadow: `
              0 0 0 2px rgba(139, 92, 246, 0.3),
              0 0 30px rgba(139, 92, 246, 0.25),
              0 8px 32px rgba(7, 7, 18, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
              transform: 'translateY(-1px)',
            },
          })
        : {}),
    },
    recordButtonActive: {
      backgroundColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
    },
    recordButtonProcessing: {
      opacity: 0.5,
      backgroundColor: Tokens.colors.neutral.dark,
    },
    recordButtonPressed: {
      opacity: 0.8,
    },
    recordIcon: {
      fontSize: Tokens.type.base,
      marginRight: Tokens.spacing[2],
      color: Tokens.colors.text.primary,
    },
    recordText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: Tokens.colors.text.primary,
      letterSpacing: 1,
    },
    errorContainer: {
      marginTop: Tokens.spacing[2],
      alignItems: 'center',
    },
    errorText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.brand[500],
      textAlign: 'center',
    },
    connectButton: {
      marginTop: Tokens.spacing[3],
      backgroundColor: Tokens.colors.indigo.primary,
      paddingHorizontal: Tokens.spacing[4],
      paddingVertical: Tokens.spacing[2],
      borderRadius: Tokens.radii.md,
    },
    connectButtonPressed: {
      opacity: 0.8,
    },
    connectButtonDisabled: {
      opacity: 0.6,
    },
    connectButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.text.primary,
      fontWeight: '700',
    },
    loadingContainer: {
      padding: Tokens.spacing[8],
      alignItems: 'center',
      gap: Tokens.spacing[4],
    },
    guideBanner: {
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.45)'
        : Tokens.colors.neutral.dark,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.35)'
        : Tokens.colors.brand[500],
      borderRadius: isCosmic ? 10 : Tokens.radii.none,
      padding: isCosmic ? 10 : Tokens.spacing[3],
      marginBottom: isCosmic ? 16 : Tokens.spacing[5],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: isCosmic ? 8 : Tokens.spacing[3],
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(20px) saturate(160%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.2),
              0 6px 28px rgba(7, 7, 18, 0.45),
              inset 0 1px 0 rgba(255, 255, 255, 0.06)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          })
        : {}),
    },
    guideContent: {
      flex: 1,
    },
    guideTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      marginBottom: isCosmic ? 2 : Tokens.spacing[1],
      letterSpacing: 1,
    },
    guideText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      lineHeight: 14,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.primary,
    },
    guideButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.6)'
        : Tokens.colors.neutral.darkest,
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(8px)',
            },
          })
        : {}),
    },
    guideButtonPressed: {
      backgroundColor: Tokens.colors.neutral.darker,
    },
    guideButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      textTransform: 'uppercase',
    },
    loadingText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  });

export default BrainDumpScreen;
