import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
  Pressable,
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
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { CosmicBackground } from '../ui/cosmic';

import {
  BrainDumpItem,
  BrainDumpInput,
  BrainDumpActionBar,
  BrainDumpRationale,
  BrainDumpGuide,
  BrainDumpVoiceRecord,
  DumpItem,
  RecordingState,
} from '../components/brain-dump';

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

interface StoredFogCutterTask {
  id: string;
  text: string;
  completed: boolean;
  microSteps: Array<{ id: string; text: string; status: string }>;
}

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

  const [items, setItems] = useState<DumpItem[]>([]);
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
  const overlayCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOverlayCountRef = useRef<number>(0);

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

      setGuideDismissed(!!guideState?.brainDumpDismissed);

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
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    loadItems();
  }, []);

  useEffect(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);

    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(StorageService.STORAGE_KEYS.brainDump, items)
        .catch((error) => console.error('Failed to persist brain dump items:', error));
    }, PERSIST_DEBOUNCE_MS);

    if (items.length !== lastOverlayCountRef.current) {
      if (overlayCountTimerRef.current) clearTimeout(overlayCountTimerRef.current);

      overlayCountTimerRef.current = setTimeout(() => {
        OverlayService.updateCount(items.length);
        lastOverlayCountRef.current = items.length;
      }, OVERLAY_COUNT_DEBOUNCE_MS);
    }

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
      if (overlayCountTimerRef.current) clearTimeout(overlayCountTimerRef.current);
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

  const addItem = (text: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newItem: DumpItem = {
      id: generateId(),
      text,
      createdAt: new Date().toISOString(),
      source: 'text',
    };
    setItems((prevItems) => {
      const next = [newItem, ...prevItems];
      if (!guideDismissed && !showGuide) {
        UXMetricsService.track('brain_dump_first_item_added');
        setShowGuide(true);
      }
      return next;
    });
    setSortedItems([]);
    setSortingError(null);
  };

  const saveSortedItemsToFogCutter = useCallback(
    async (nextSortedItems: SortedItem[]): Promise<number> => {
      const existingTasks =
        (await StorageService.getJSON<StoredFogCutterTask[]>(
          StorageService.STORAGE_KEYS.tasks,
        )) ?? [];

      const existingTextSet = new Set(
        existingTasks.map((task) => task.text.trim().toLowerCase()),
      );

      const newTasks: StoredFogCutterTask[] = [];
      nextSortedItems.forEach((item) => {
        const task = toFogCutterTask(item);
        if (!task) return;
        const key = task.text.trim().toLowerCase();
        if (existingTextSet.has(key)) return;

        existingTextSet.add(key);
        newTasks.push(task);
      });

      if (newTasks.length > 0) {
        await StorageService.setJSON(StorageService.STORAGE_KEYS.tasks, [
          ...existingTasks,
          ...newTasks,
        ]);
      }
      return newTasks.length;
    },
    [],
  );

  const runSortAndSyncPipeline = useCallback(
    async (sourceItems: string[]) => {
      if (sourceItems.length === 0) return;

      const sorted = await AISortService.sortItems(sourceItems);
      setSortedItems(sorted);

      const [createdTaskCount, exportResult] = await Promise.all([
        saveSortedItemsToFogCutter(sorted),
        GoogleTasksSyncService.syncSortedItemsToGoogle(sorted),
      ]);

      if (exportResult.authRequired) {
        setGoogleAuthRequired(true);
        if (Platform.OS === 'web') {
          setSortingError('Google sign-in is not available on web yet. Please use the mobile app to sync with Google Tasks.');
        } else {
          setSortingError(exportResult.errorMessage || 'Google sign-in required to sync Tasks and Calendar exports.');
        }
      } else if (exportResult.errorMessage) {
        setGoogleAuthRequired(false);
        setSortingError(exportResult.errorMessage);
      } else if (createdTaskCount > 0 || exportResult.createdTasks > 0 || exportResult.createdEvents > 0) {
        setSortingError(null);
        setGoogleAuthRequired(false);
        AccessibilityInfo.announceForAccessibility('Tasks synced and suggestions saved.');
      }
    },
    [saveSortedItemsToFogCutter],
  );

  const handleConnectGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      setSortingError('Google sign-in is not available on web yet.');
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

      const exportResult = await GoogleTasksSyncService.syncSortedItemsToGoogle(sortedItems);

      if (exportResult.authRequired) {
        setGoogleAuthRequired(true);
        setSortingError(exportResult.errorMessage || 'Google sign-in required.');
        return;
      }

      if (exportResult.errorMessage) {
        setGoogleAuthRequired(false);
        setSortingError(exportResult.errorMessage);
        return;
      }

      setGoogleAuthRequired(false);
      setSortingError(null);
      AccessibilityInfo.announceForAccessibility('Tasks synced and suggestions saved.');
    } finally {
      setIsConnectingGoogle(false);
    }
  }, [sortedItems]);

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
        setRecordingError('Could not start recording. Check microphone permissions.');
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

        const sourceItems = transcriptionToSortItems(transcription.transcription);
        if (sourceItems.length > 0) {
          try {
            await runSortAndSyncPipeline(sourceItems);
            setSortingError(null);
          } catch (error) {
            setSortingError(error instanceof Error ? error.message : 'Failed to sync transcription suggestions.');
          }
        }
      } else {
        setRecordingError(transcription.error || 'Transcription failed. Audio saved locally.');
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setItems((prevItems) => [
          {
            id: generateId(),
            text: '[Voice Note: Transcription Failed]',
            createdAt: new Date().toISOString(),
            source: 'audio',
            audioPath: result.uri,
          },
          ...prevItems,
        ]);
      }

      setRecordingState('idle');
    }
  }, [guideDismissed, recordingError, recordingState, runSortAndSyncPipeline, showGuide]);

  useEffect(() => {
    if (!route.params?.autoRecord || hasAutoRecorded.current) return;
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
    Alert.alert(
      'CLEAR_DATA?',
      'IRREVERSIBLE_ACTION.',
      [
        { text: 'ABORT', style: 'cancel' },
        {
          text: 'CONFIRM',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setItems([]);
            setSortedItems([]);
            setSortingError(null);
            AccessibilityInfo.announceForAccessibility('All items cleared.');
          }
        },
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
      setSortingError(error instanceof Error ? error.message : 'AI sort is currently unavailable.');
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
    if (priority === 'high') return styles.priorityHigh;
    if (priority === 'medium') return styles.priorityMedium;
    return styles.priorityLow;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>BRAIN_DUMP</Text>
            <View style={styles.headerLine} />
          </View>

          <BrainDumpRationale />

          <BrainDumpInput onAdd={addItem} />

          <BrainDumpGuide
            showGuide={showGuide}
            onDismiss={dismissGuide}
          />

          <BrainDumpVoiceRecord
            recordingState={recordingState}
            recordingError={recordingError}
            onRecordPress={handleRecordPress}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Tokens.colors.brand[500]} />
              <Text style={styles.loadingText}>LOADING...</Text>
            </View>
          ) : (
            <BrainDumpActionBar
              itemCount={items.length}
              isSorting={isSorting}
              onSort={handleAISort}
              onClear={clearAll}
            />
          )}

          {sortingError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{sortingError}</Text>
              {googleAuthRequired && Platform.OS !== 'web' && (
                <Pressable
                  onPress={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  style={({ pressed }) => [
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

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BrainDumpItem item={item} onDelete={deleteItem} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !isLoading ? (
                <Text style={[styles.title, styles.emptyState]}>
                  _AWAITING_INPUT
                </Text>
              ) : null
            }
            ListFooterComponent={
              sortedItems.length > 0 ? (
                <View style={styles.sortedSection}>
                  <Text style={styles.sortedHeader}>AI_SUGGESTIONS</Text>
                  {groupedSortedItems.map(({ category, items: catItems }) => (
                    <View key={category} style={styles.categorySection}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      {catItems.map((item, idx) => (
                        <View key={idx} style={styles.sortedItemRow}>
                          <Text style={styles.sortedItemText}>
                            {item.duration ? `[${item.duration}] ` : ''}
                            {item.text}
                          </Text>
                          <View
                            style={[
                              styles.priorityBadge,
                              getPriorityStyle(item.priority),
                            ]}
                          >
                            <Text style={styles.priorityText}>{item.priority}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ) : null
            }
          />
        </View>
      </View>
      {isCosmic && <CosmicBackground showGrid={true} intensity="low" />}
    </SafeAreaView>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic ? '#070712' : Tokens.colors.neutral.darkest,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      zIndex: 1,
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth,
      padding: Tokens.spacing[4],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isCosmic ? 16 : Tokens.spacing[5],
      marginTop: Tokens.spacing[4],
    },
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontWeight: '700',
      letterSpacing: 2,
    },
    headerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.3)'
        : Tokens.colors.neutral.border,
      marginLeft: Tokens.spacing[4],
    },
    loadingContainer: {
      padding: Tokens.spacing[8],
      alignItems: 'center',
      gap: Tokens.spacing[4],
    },
    loadingText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    errorContainer: {
      marginTop: Tokens.spacing[2],
      marginBottom: Tokens.spacing[4],
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
    emptyState: {
      marginTop: Tokens.spacing[12],
      opacity: 0.3,
    },
    listContent: {
      paddingBottom: 120,
    },
    sortedSection: {
      marginTop: Tokens.spacing[6],
      paddingTop: Tokens.spacing[4],
      borderTopWidth: 1,
      borderTopColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.border,
    },
    sortedHeader: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      marginBottom: Tokens.spacing[4],
      letterSpacing: 1,
    },
    categorySection: {
      marginBottom: Tokens.spacing[4],
    },
    categoryTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      textTransform: 'uppercase',
      marginBottom: Tokens.spacing[2],
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.1)'
        : Tokens.colors.neutral.dark,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
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
  });

export default BrainDumpScreen;
