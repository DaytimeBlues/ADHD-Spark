import React, { useEffect, useState, useCallback } from 'react';
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
import StorageService from '../services/StorageService';
import RecordingService from '../services/RecordingService';
import PlaudService from '../services/PlaudService';
import OverlayService from '../services/OverlayService';
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

interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
  source: 'text' | 'audio';  // Track origin
  audioPath?: string;        // Optional local file path
}

type RecordingState = 'idle' | 'recording' | 'processing';

const BrainDumpScreen = () => {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);

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
  };

  const clearAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems([]);
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
              <Pressable
                onPress={clearAll}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  hovered && styles.clearHovered,
                  pressed && styles.clearPressed,
                ]}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </Pressable>
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
