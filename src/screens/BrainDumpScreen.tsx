import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import StorageService from '../services/StorageService';
import RecordingService from '../services/RecordingService';
import PlaudService from '../services/PlaudService';
import OverlayService from '../services/OverlayService';
import AISortService, { SortedItem } from '../services/AISortService';
import { generateId } from '../utils/helpers';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

const INPUT_HEIGHT = 56;
const HIT_SLOP = {
  top: Tokens.spacing[4],
  bottom: Tokens.spacing[4],
  left: Tokens.spacing[4],
  right: Tokens.spacing[4],
};

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
  source: 'text' | 'audio';  // Track origin
  audioPath?: string;        // Optional local file path
}

type RecordingState = 'idle' | 'recording' | 'processing';

type BrainDumpRouteParams = {
  autoRecord?: boolean;
};

type BrainDumpRoute = RouteProp<Record<'Tasks', BrainDumpRouteParams>, 'Tasks'>;

const BrainDumpScreen = () => {
  const route = useRoute<BrainDumpRoute>();
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [sortingError, setSortingError] = useState<string | null>(null);
  const [sortedItems, setSortedItems] = useState<SortedItem[]>([]);
  const hasAutoRecorded = useRef(false);

  const loadItems = async () => {
    const storedItems = await StorageService.getJSON<DumpItem[]>(
      StorageService.STORAGE_KEYS.brainDump,
    );
    if (!storedItems || !Array.isArray(storedItems)) {
      return;
    }

    const normalized = storedItems.filter((item) => {
      return Boolean(item?.id && item?.text && item?.createdAt);
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(normalized);
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
    StorageService.setJSON(StorageService.STORAGE_KEYS.brainDump, items);
    OverlayService.updateCount(items.length);
  }, [items]);

  useEffect(() => {
    if (!route.params?.autoRecord || hasAutoRecorded.current) {
      return;
    }

    hasAutoRecorded.current = true;
    handleRecordPress();
  }, [handleRecordPress, route.params?.autoRecord]);

  const addItem = () => {
    if (input.trim()) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const newItem: DumpItem = {
        id: generateId(),
        text: input.trim(),
        createdAt: new Date().toISOString(),
        source: 'text',
      };
      setItems((prevItems) => [newItem, ...prevItems]);
      setInput('');
      setSortedItems([]);
      setSortingError(null);
    }
  };

  // Handle recording toggle
  const handleRecordPress = useCallback(async () => {
    setRecordingError(null);

    if (recordingState === 'idle') {
      // Start recording
      const started = await RecordingService.startRecording();
      if (started) {
        setRecordingState('recording');
      } else {
        setRecordingError('Could not start recording. Check microphone permissions.');
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
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newItem: DumpItem = {
          id: generateId(),
          text: transcription.transcription,
          createdAt: new Date().toISOString(),
          source: 'audio',
          audioPath: result.uri,
        };
        setItems((prevItems) => [newItem, ...prevItems]);
      } else {
        setRecordingError(transcription.error || 'Transcription failed.');
      }

      setRecordingState('idle');
    }
  }, [recordingState]);

  const deleteItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setSortedItems([]);
    setSortingError(null);
  };

  const clearAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems([]);
    setSortedItems([]);
    setSortingError(null);
  };

  const handleAISort = async () => {
    setSortingError(null);
    setIsSorting(true);

    try {
      const sorted = await AISortService.sortItems(items.map((item) => item.text));
      setSortedItems(sorted);
    } catch (error) {
      setSortingError(
        error instanceof Error ? error.message : 'AI sort is currently unavailable.',
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

    return CATEGORY_ORDER
      .map((category) => ({
        category,
        items: grouped.get(category) ?? [],
      }))
      .filter((entry) => entry.items.length > 0);
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
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>Brain Dump</Text>
            <Text style={styles.subtitle}>
              Unload your thoughts. We'll keep them safe.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor={Tokens.colors.text.tertiary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={addItem}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                multiline={false}
              />
            </View>
            <LinearButton
              title="Add"
              onPress={addItem}
              size="lg"
              style={styles.addButton}
            />
          </View>

          {/* Recording Button */}
          <View style={styles.recordSection}>
            <Pressable
              onPress={handleRecordPress}
              disabled={recordingState === 'processing'}
              style={({ pressed }) => [
                styles.recordButton,
                recordingState === 'recording' && styles.recordButtonActive,
                recordingState === 'processing' && styles.recordButtonProcessing,
                pressed && styles.recordButtonPressed,
              ]}
            >
              {recordingState === 'processing' ? (
                <ActivityIndicator size="small" color={Tokens.colors.text.primary} />
              ) : (
                <Text style={styles.recordIcon}>
                  {recordingState === 'recording' ? '⏹️' : '🎙️'}
                </Text>
              )}
              <Text style={styles.recordText}>
                {recordingState === 'idle' && 'Record'}
                {recordingState === 'recording' && 'Stop'}
                {recordingState === 'processing' && 'Processing...'}
              </Text>
            </Pressable>
            {recordingError && (
              <Text style={styles.errorText}>{recordingError}</Text>
            )}
          </View>

          {items.length > 0 && (
            <View style={styles.actionsBar}>
              <Text style={styles.countText}>{items.length} items</Text>
              <View style={styles.actionsRight}>
                <Pressable
                  onPress={handleAISort}
                  disabled={isSorting}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.actionButton,
                    hovered && styles.clearHovered,
                    pressed && styles.clearPressed,
                    isSorting && styles.actionButtonDisabled,
                  ]}
                >
                  <Text style={styles.aiSortText}>{isSorting ? 'Sorting...' : 'AI Sort'}</Text>
                </Pressable>
                <Pressable
                  onPress={clearAll}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.actionButton,
                    hovered && styles.clearHovered,
                    pressed && styles.clearPressed,
                  ]}
                >
                  <Text style={styles.clearText}>Clear All</Text>
                </Pressable>
              </View>
            </View>
          )}

          {sortingError && <Text style={styles.errorText}>{sortingError}</Text>}

          {groupedSortedItems.length > 0 && (
            <View style={styles.sortedSection}>
              <Text style={styles.sortedTitle}>AI Suggestions</Text>
              {groupedSortedItems.map(({ category, items: categoryItems }) => (
                <View key={category} style={styles.sortedGroup}>
                  <Text style={styles.sortedCategory}>{category.toUpperCase()}</Text>
                  {categoryItems.map((item, index) => (
                    <View key={`${category}-${index}-${item.text}`} style={styles.sortedItemRow}>
                      <Text style={styles.sortedItemText}>{item.text}</Text>
                      <View style={[styles.priorityBadge, getPriorityStyle(item.priority)]}>
                        <Text style={styles.priorityText}>{item.priority}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>☁️</Text>
                <Text style={styles.emptyText}>
                  Your mind is clear... for now.
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    padding: Tokens.spacing[6],
  },
  header: {
    marginBottom: Tokens.spacing[8],
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[2],
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
  },
  // Input
  inputSection: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[8],
    gap: Tokens.spacing[3],
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    minHeight: INPUT_HEIGHT,
    justifyContent: 'center',
    ...Platform.select({
      web: { transition: Tokens.motion.transitions.base },
    }),
  },
  inputWrapperFocused: {
    borderColor: Tokens.colors.brand[500],
    ...Platform.select({
      web: { boxShadow: `0 0 0 2px ${Tokens.colors.brand[900]}` },
    }),
  },
  input: {
    paddingHorizontal: Tokens.spacing[4],
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    minHeight: INPUT_HEIGHT,
    textAlignVertical: 'center',
    paddingVertical: 0, // Fix alignment
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  addButton: {
    minHeight: INPUT_HEIGHT,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Actions
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing[4],
    paddingHorizontal: Tokens.spacing[2],
    alignItems: 'center',
  },
  countText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clearText: {
    fontFamily: 'Inter',
    color: Tokens.colors.error.main,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiSortText: {
    fontFamily: 'Inter',
    color: Tokens.colors.brand[400],
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  actionsRight: {
    flexDirection: 'row',
    gap: Tokens.spacing[3],
  },
  actionButton: {
    minHeight: Tokens.layout.minTapTargetComfortable,
    minWidth: Tokens.layout.minTapTargetComfortable,
    justifyContent: 'center',
    paddingHorizontal: Tokens.spacing[2],
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  sortedSection: {
    marginBottom: Tokens.spacing[6],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[4],
    backgroundColor: Tokens.colors.neutral.darker,
  },
  sortedTitle: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    marginBottom: Tokens.spacing[3],
  },
  sortedGroup: {
    marginBottom: Tokens.spacing[3],
  },
  sortedCategory: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    marginBottom: Tokens.spacing[2],
    letterSpacing: 0.6,
  },
  sortedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Tokens.spacing[2],
    marginBottom: Tokens.spacing[2],
  },
  sortedItemText: {
    flex: 1,
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.sm,
  },
  priorityBadge: {
    borderRadius: Tokens.radii.full,
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: Tokens.spacing[1],
  },
  priorityText: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.xs,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: Tokens.colors.text.primary,
  },
  priorityHigh: {
    backgroundColor: `${Tokens.colors.error.main}55`,
  },
  priorityMedium: {
    backgroundColor: `${Tokens.colors.warning.main}55`,
  },
  priorityLow: {
    backgroundColor: `${Tokens.colors.success.main}55`,
  },
  clearHovered: {
    opacity: 0.8,
  },
  clearPressed: {
    opacity: 0.6,
  },
  // List
  listContent: {
    paddingBottom: Tokens.spacing[16],
  },
  item: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.lg,
    paddingHorizontal: Tokens.spacing[5],
    paddingVertical: Tokens.spacing[4],
    marginBottom: Tokens.spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
      },
    }),
  },
  itemText: {
    flex: 1,
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    lineHeight: 24,
    marginRight: Tokens.spacing[4],
  },
  deleteButton: {
    padding: Tokens.spacing[2],
    borderRadius: Tokens.radii.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { transition: Tokens.motion.transitions.base },
    }),
  },
  deleteButtonHovered: {
    backgroundColor: Tokens.colors.neutral.dark,
  },
  deleteButtonPressed: {
    backgroundColor: Tokens.colors.error.subtle,
  },
  deleteText: {
    color: Tokens.colors.text.tertiary,
    fontSize: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: Tokens.spacing[12],
    opacity: 0.5,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Tokens.spacing[4],
  },
  emptyText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.base,
  },
  // Recording
  recordSection: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[8],
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tokens.colors.neutral.darker,
    paddingHorizontal: Tokens.spacing[6],
    paddingVertical: Tokens.spacing[3],
    borderRadius: Tokens.radii.full,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    minWidth: 160,
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: Tokens.colors.error.main + '20', // Subtle red
    borderColor: Tokens.colors.error.main,
  },
  recordButtonProcessing: {
    opacity: 0.7,
  },
  recordButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  recordIcon: {
    fontSize: 20,
    marginRight: Tokens.spacing[2],
  },
  recordText: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    fontWeight: '600',
    color: Tokens.colors.text.primary,
  },
  errorText: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.xs,
    color: Tokens.colors.error.main,
    marginTop: Tokens.spacing[2],
    textAlign: 'center',
  },
});

export default BrainDumpScreen;
