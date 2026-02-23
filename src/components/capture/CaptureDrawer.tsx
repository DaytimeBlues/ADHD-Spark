/**
 * CaptureDrawer
 *
 * Bottom sheet drawer with 5 capture modes:
 * voice | text | photo | paste | meeting
 *
 * Opens via CaptureBubble FAB. Each mode saves a CaptureItem
 * to the inbox via CaptureService.
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { BottomSheet } from '../../ui/cosmic/BottomSheet';
import CaptureService, { CaptureSource } from '../../services/CaptureService';
import RecordingService from '../../services/RecordingService';
import type { BubbleState } from './CaptureBubble';

// ============================================================================
// TYPES
// ============================================================================

export interface CaptureDrawerProps {
  visible: boolean;
  onClose: () => void;
  /** Notify CaptureBubble of state changes (recording, processing, etc.) */
  onStateChange: (state: BubbleState) => void;
  currentBubbleState: BubbleState;
}

type DrawerMode = CaptureSource;

// ============================================================================
// CONSTANTS
// ============================================================================

const MODES: Array<{ id: DrawerMode; icon: string; label: string }> = [
  { id: 'voice', icon: '🎙', label: 'VOICE' },
  { id: 'text', icon: '⌨', label: 'TEXT' },
  { id: 'photo', icon: '📷', label: 'PHOTO' },
  { id: 'paste', icon: '📋', label: 'PASTE' },
  { id: 'meeting', icon: '👥', label: 'MEETING' },
  { id: 'checkin', icon: '🎯', label: 'CHECK-IN' },
];

const MEETING_TEMPLATE = (now: Date): string => {
  const date = now.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Meeting: ${date} at ${time}\n\nAttendees:\n\nNotes:\n\nAction items:\n`;
};

// Cosmic colors
const C = {
  violet: '#8B5CF6',
  teal: '#2DD4BF',
  rose: '#FB7185',
  gold: '#F6C177',
  starlight: '#EEF2FF',
  mist: '#B9C2D9',
  mutedText: 'rgba(238,242,255,0.56)',
  surface: 'rgba(18, 26, 52, 0.96)',
  border: 'rgba(185, 194, 217, 0.12)',
  activeModeTab: 'rgba(139, 92, 246, 0.15)',
} as const;

// ============================================================================
// VOICE MODE
// ============================================================================

interface VoiceModeProps {
  onCapture: (raw: string, transcript?: string) => void;
  onStateChange: (state: BubbleState) => void;
}

const VoiceMode = memo(function VoiceMode({
  onCapture,
  onStateChange,
}: VoiceModeProps) {
  const [phase, setPhase] = useState<
    'idle' | 'recording' | 'processing' | 'done' | 'error'
  >('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setElapsedMs(0);
    timerRef.current = setInterval(() => {
      setElapsedMs((prev) => prev + 100);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    setErrorMsg('');
    const granted = await RecordingService.requestPermissions();
    if (!granted) {
      setPhase('error');
      setErrorMsg('Microphone permission denied. Tap to grant access.');
      return;
    }
    const started = await RecordingService.startRecording();
    if (!started) {
      setPhase('error');
      setErrorMsg('Could not start recording. Please try again.');
      return;
    }
    setPhase('recording');
    onStateChange('recording');
    startTimer();
  }, [onStateChange, startTimer]);

  const handleStopRecording = useCallback(async () => {
    stopTimer();
    setPhase('processing');
    onStateChange('processing');
    const result = await RecordingService.stopRecording();
    if (!result) {
      setPhase('error');
      setErrorMsg('Recording failed. Please try again.');
      onStateChange('idle');
      return;
    }
    // In v1, use uri as raw — transcription is async/future
    // For now, create a placeholder transcript
    const rawText = `[Voice note — ${Math.round(result.duration / 1000)}s recording]`;
    setTranscript(rawText);
    setPhase('done');
    onStateChange('idle');
  }, [stopTimer, onStateChange]);

  const handleConfirm = useCallback(() => {
    onCapture(transcript, transcript);
  }, [onCapture, transcript]);

  const handleDiscard = useCallback(() => {
    setPhase('idle');
    setTranscript('');
    setErrorMsg('');
    onStateChange('idle');
  }, [onStateChange]);

  const elapsed = `${Math.floor(elapsedMs / 60000)}:${String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0')}`;

  return (
    <View style={styles.modeContent}>
      {phase === 'idle' && (
        <Pressable
          testID="capture-record-toggle"
          style={[styles.recordBtn, { backgroundColor: C.violet }]}
          onPress={handleStartRecording}
          accessibilityLabel="Start recording"
          accessibilityRole="button"
        >
          <Text style={styles.recordBtnIcon}>🎙</Text>
          <Text style={styles.recordBtnLabel}>TAP TO RECORD</Text>
        </Pressable>
      )}

      {phase === 'recording' && (
        <View style={styles.recordingActive}>
          <View
            style={[styles.recordingIndicator, { backgroundColor: C.teal }]}
          />
          <Text style={[styles.recordingTime, { color: C.teal }]}>
            {elapsed}
          </Text>
          <Text style={[styles.recordingHint, { color: C.mutedText }]}>
            Recording…
          </Text>
          <Pressable
            testID="capture-stop-recording"
            style={[styles.stopBtn, { borderColor: C.teal }]}
            onPress={handleStopRecording}
            accessibilityLabel="Stop recording"
            accessibilityRole="button"
          >
            <Text style={[styles.stopBtnText, { color: C.teal }]}>■ STOP</Text>
          </Pressable>
        </View>
      )}

      {phase === 'processing' && (
        <View style={styles.processingState}>
          <ActivityIndicator size="large" color={C.violet} />
          <Text style={[styles.processingText, { color: C.mutedText }]}>
            Processing…
          </Text>
        </View>
      )}

      {phase === 'done' && (
        <View style={styles.transcriptContainer}>
          <Text style={[styles.transcriptLabel, { color: C.mutedText }]}>
            CAPTURED
          </Text>
          <Text style={[styles.transcriptText, { color: C.starlight }]}>
            {transcript}
          </Text>
          <View style={styles.confirmRow}>
            <Pressable
              style={[styles.confirmBtn, { backgroundColor: C.violet }]}
              onPress={handleConfirm}
              testID="capture-confirm"
              accessibilityLabel="Save to inbox"
              accessibilityRole="button"
            >
              <Text style={styles.confirmBtnText}>SAVE TO INBOX</Text>
            </Pressable>
            <Pressable
              style={[styles.discardBtn, { borderColor: C.rose }]}
              onPress={handleDiscard}
              accessibilityLabel="Discard recording"
              accessibilityRole="button"
            >
              <Text style={[styles.discardBtnText, { color: C.rose }]}>
                DISCARD
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {phase === 'error' && (
        <View style={styles.errorState}>
          <Text style={[styles.errorText, { color: C.rose }]}>{errorMsg}</Text>
          <Pressable
            style={[styles.retryBtn, { borderColor: C.violet }]}
            onPress={() => {
              setPhase('idle');
              setErrorMsg('');
            }}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={[styles.retryBtnText, { color: C.violet }]}>
              TRY AGAIN
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

// ============================================================================
// TEXT MODE
// ============================================================================

interface TextModeProps {
  onCapture: (raw: string) => void;
}

const TextMode = memo(function TextMode({ onCapture }: TextModeProps) {
  const [text, setText] = useState('');

  const handleConfirm = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onCapture(trimmed);
    setText('');
  }, [text, onCapture]);

  return (
    <View style={styles.modeContent}>
      <TextInput
        testID="capture-text-input"
        style={[
          styles.textInput,
          { color: C.starlight, borderColor: C.border },
        ]}
        value={text}
        onChangeText={setText}
        placeholder="Type anything — tasks, thoughts, ideas…"
        placeholderTextColor={C.mutedText}
        multiline
        autoFocus
        numberOfLines={4}
        textAlignVertical="top"
        returnKeyType="default"
        accessibilityLabel="Capture text input"
      />
      <Pressable
        testID="capture-confirm"
        style={[
          styles.confirmBtn,
          { backgroundColor: text.trim() ? C.violet : C.border },
          styles.marginTop12,
        ]}
        onPress={handleConfirm}
        disabled={!text.trim()}
        accessibilityLabel="Save to inbox"
        accessibilityRole="button"
      >
        <Text style={styles.confirmBtnText}>SAVE TO INBOX</Text>
      </Pressable>
    </View>
  );
});

// ============================================================================
// PASTE MODE
// ============================================================================

interface PasteModeProps {
  onCapture: (raw: string) => void;
}

const PasteMode = memo(function PasteMode({ onCapture }: PasteModeProps) {
  const [text, setText] = useState('');
  const [isPasting, setIsPasting] = useState(false);

  const handleAutoPaste = useCallback(async () => {
    setIsPasting(true);
    try {
      if (Platform.OS === 'web') {
        // navigator.clipboard is a web-only API; cast for type safety
        const webNavigator = navigator as typeof navigator & {
          clipboard?: { readText: () => Promise<string> };
        };
        if (webNavigator.clipboard) {
          const pasted = await webNavigator.clipboard.readText();
          setText(pasted);
        }
      } else {
        // React Native Clipboard not available without @react-native-clipboard/clipboard
        // Fall back to manual text entry
        setText('');
      }
    } catch (err) {
      console.error('[PasteMode] clipboard read error:', err);
    } finally {
      setIsPasting(false);
    }
  }, []);

  React.useEffect(() => {
    handleAutoPaste();
  }, [handleAutoPaste]);

  const handleConfirm = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onCapture(trimmed);
    setText('');
  }, [text, onCapture]);

  return (
    <View style={styles.modeContent}>
      {isPasting ? (
        <ActivityIndicator color={C.violet} size="small" />
      ) : (
        <>
          <Text style={[styles.pasteHint, { color: C.mutedText }]}>
            {text ? 'Edit before saving:' : 'Paste or type content:'}
          </Text>
          <TextInput
            testID="capture-text-input"
            style={[
              styles.textInput,
              { color: C.starlight, borderColor: C.border },
            ]}
            value={text}
            onChangeText={setText}
            placeholder="Paste text here…"
            placeholderTextColor={C.mutedText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Paste capture input"
          />
          <Pressable
            testID="capture-confirm"
            style={[
              styles.confirmBtn,
              {
                backgroundColor: text.trim() ? C.violet : C.border,
              },
              styles.marginTop12,
            ]}
            onPress={handleConfirm}
            disabled={!text.trim()}
            accessibilityLabel="Save to inbox"
            accessibilityRole="button"
          >
            <Text style={styles.confirmBtnText}>SAVE TO INBOX</Text>
          </Pressable>
        </>
      )}
    </View>
  );
});

// ============================================================================
// MEETING MODE
// ============================================================================

interface MeetingModeProps {
  onCapture: (raw: string) => void;
}

const MeetingMode = memo(function MeetingMode({ onCapture }: MeetingModeProps) {
  const [notes, setNotes] = useState(() => MEETING_TEMPLATE(new Date()));

  const handleConfirm = useCallback(() => {
    const trimmed = notes.trim();
    if (!trimmed) {
      return;
    }
    onCapture(trimmed);
    setNotes(MEETING_TEMPLATE(new Date()));
  }, [notes, onCapture]);

  return (
    <View style={styles.modeContent}>
      <Text style={[styles.meetingLabel, { color: C.mutedText }]}>
        MEETING NOTES
      </Text>
      <TextInput
        testID="capture-meeting-input"
        style={[
          styles.textInputMeeting,
          { color: C.starlight, borderColor: C.border },
        ]}
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Meeting notes input"
      />
      <Pressable
        testID="capture-confirm"
        style={[
          styles.confirmBtn,
          { backgroundColor: C.violet },
          styles.marginTop12,
        ]}
        onPress={handleConfirm}
        accessibilityLabel="Save meeting to inbox"
        accessibilityRole="button"
      >
        <Text style={styles.confirmBtnText}>SAVE MEETING NOTES</Text>
      </Pressable>
    </View>
  );
});

// ============================================================================
// PHOTO MODE
// ============================================================================

interface PhotoModeProps {
  onCapture: (raw: string, attachmentUri?: string) => void;
}

const PhotoMode = memo(function PhotoMode({ onCapture }: PhotoModeProps) {
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const handlePickFile = useCallback(() => {
    if (Platform.OS === 'web') {
      // document and HTMLInputElement are web-only APIs; use globalThis cast
      const doc = (
        globalThis as typeof globalThis & {
          document?: {
            createElement: (tag: 'input') => {
              type: string;
              accept: string;
              onchange:
                | ((e: {
                    target: { files?: { 0?: { name: string } } };
                  }) => void)
                | null;
              click: () => void;
            };
          };
        }
      ).document;
      if (!doc) {
        return;
      }
      const input = doc.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const files = (e.target as { files?: { 0?: unknown; length: number } })
          .files;
        const file = files?.[0];
        if (file) {
          const uri = URL.createObjectURL(file as unknown as Blob);
          setSelectedUri(uri);
        }
      };
      input.click();
    }
    // Native: would use react-native-image-picker (v2 scope)
  }, []);

  const handleConfirm = useCallback(() => {
    const raw = caption.trim() || '[Photo capture]';
    onCapture(raw, selectedUri ?? undefined);
    setSelectedUri(null);
    setCaption('');
  }, [caption, selectedUri, onCapture]);

  return (
    <View style={styles.modeContent}>
      {selectedUri ? (
        <View style={styles.photoPreview}>
          <Text style={[styles.photoPreviewLabel, { color: C.mutedText }]}>
            📷 Photo selected
          </Text>
          <TextInput
            testID="capture-text-input"
            style={[
              styles.textInput,
              { color: C.starlight, borderColor: C.border },
            ]}
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption (optional)…"
            placeholderTextColor={C.mutedText}
            accessibilityLabel="Photo caption input"
          />
          <Pressable
            testID="capture-confirm"
            style={[
              styles.confirmBtn,
              { backgroundColor: C.violet },
              styles.marginTop12,
            ]}
            onPress={handleConfirm}
            accessibilityLabel="Save photo to inbox"
            accessibilityRole="button"
          >
            <Text style={styles.confirmBtnText}>SAVE TO INBOX</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.photoPickBtn, { borderColor: C.violet }]}
          onPress={handlePickFile}
          accessibilityLabel="Select a photo"
          accessibilityRole="button"
        >
          <Text style={styles.photoPickIcon}>📷</Text>
          <Text style={[styles.photoPickLabel, { color: C.violet }]}>
            SELECT PHOTO
          </Text>
          {Platform.OS !== 'web' && (
            <Text style={[styles.photoPickHint, { color: C.mutedText }]}>
              Camera/gallery coming in v2
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
});

// ============================================================================
// CHECK-IN MODE
// ============================================================================

interface CheckInModeProps {
  onCapture: (raw: string) => void;
}

const CheckInMode = memo(function CheckInMode({ onCapture }: CheckInModeProps) {
  const [text, setText] = useState('');

  const handleConfirm = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onCapture(`[Check-In]\n${trimmed}`);
    setText('');
  }, [text, onCapture]);

  return (
    <View style={styles.modeContent}>
      <Text style={[styles.meetingLabel, styles.checkInPrompt]}>
        What are you doing?{'\n'}What should you be doing?
      </Text>

      <TextInput
        testID="capture-checkin-input"
        style={[
          styles.textInput,
          { color: C.starlight, borderColor: C.border },
        ]}
        value={text}
        onChangeText={setText}
        placeholder="Log your progress here..."
        placeholderTextColor={C.mutedText}
        multiline
        autoFocus
        numberOfLines={6}
        textAlignVertical="top"
        accessibilityLabel="Check-in input"
      />
      <Pressable
        testID="capture-checkin-confirm"
        style={[
          styles.confirmBtn,
          { backgroundColor: text.trim() ? C.gold : C.border },
          styles.marginTop12,
        ]}
        onPress={handleConfirm}
        disabled={!text.trim()}
        accessibilityLabel="Save check-in"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.confirmBtnText,
            text.trim()
              ? styles.checkInBtnTextActive
              : styles.checkInBtnTextDisabled,
          ]}
        >
          LOG PROGRESS
        </Text>
      </Pressable>
    </View>
  );
});

// ============================================================================
// MAIN DRAWER
// ============================================================================

export const CaptureDrawer = memo(function CaptureDrawer({
  visible,
  onClose,
  onStateChange,
  currentBubbleState,
}: CaptureDrawerProps) {
  const [activeMode, setActiveMode] = useState<DrawerMode>('text');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible && currentBubbleState === 'needs-checkin') {
      setActiveMode('checkin');
    }
  }, [visible, currentBubbleState]);

  const showSuccess = useCallback(
    (msg: string) => {
      setSuccessMsg(msg);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    },
    [onClose],
  );

  const handleCapture = useCallback(
    async (
      source: CaptureSource,
      raw: string,
      extra?: { transcript?: string; attachmentUri?: string },
    ) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await CaptureService.save({
          source,
          raw,
          transcript: extra?.transcript,
          attachmentUri: extra?.attachmentUri,
        });
        showSuccess('Saved to inbox ✓');
      } catch (err) {
        console.error('[CaptureDrawer] save error:', err);
        setSaveError('Failed to save. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [showSuccess],
  );

  const handleVoiceCapture = useCallback(
    (raw: string, transcript?: string) =>
      handleCapture('voice', raw, { transcript }),
    [handleCapture],
  );
  const handleTextCapture = useCallback(
    (raw: string) => handleCapture('text', raw),
    [handleCapture],
  );
  const handlePasteCapture = useCallback(
    (raw: string) => handleCapture('paste', raw),
    [handleCapture],
  );
  const handleMeetingCapture = useCallback(
    (raw: string) => handleCapture('meeting', raw),
    [handleCapture],
  );
  const handleCheckInCapture = useCallback(
    (raw: string) => handleCapture('checkin', raw),
    [handleCapture],
  );
  const handlePhotoCapture = useCallback(
    (raw: string, attachmentUri?: string) =>
      handleCapture('photo', raw, { attachmentUri }),
    [handleCapture],
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="CAPTURE"
      testID="capture-drawer"
      maxHeightFraction={0.85}
      scrollable={false}
    >
      {/* Success flash */}
      {successMsg !== '' && (
        <View style={styles.successBanner}>
          <Text style={[styles.successText, { color: C.teal }]}>
            {successMsg}
          </Text>
        </View>
      )}

      {/* Mode tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.modeTabsScroll}
        contentContainerStyle={styles.modeTabsContent}
      >
        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            testID={`capture-mode-${mode.id}`}
            style={[
              styles.modeTab,
              activeMode === mode.id && {
                backgroundColor: C.activeModeTab,
                borderColor: C.violet,
              },
            ]}
            onPress={() => setActiveMode(mode.id)}
            accessibilityLabel={`${mode.label} capture mode`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeMode === mode.id }}
          >
            <Text style={styles.modeTabIcon}>{mode.icon}</Text>
            <Text
              style={[
                styles.modeTabLabel,
                { color: activeMode === mode.id ? C.violet : C.mutedText },
              ]}
            >
              {mode.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Active mode content */}
      <View style={styles.modePanel}>
        {activeMode === 'voice' && (
          <VoiceMode
            onCapture={handleVoiceCapture}
            onStateChange={onStateChange}
          />
        )}
        {activeMode === 'text' && <TextMode onCapture={handleTextCapture} />}
        {activeMode === 'paste' && <PasteMode onCapture={handlePasteCapture} />}
        {activeMode === 'meeting' && (
          <MeetingMode onCapture={handleMeetingCapture} />
        )}
        {activeMode === 'checkin' && (
          <CheckInMode onCapture={handleCheckInCapture} />
        )}
        {activeMode === 'photo' && <PhotoMode onCapture={handlePhotoCapture} />}
      </View>

      {/* Offline banner */}
      {currentBubbleState === 'offline' && (
        <View style={styles.offlineBanner}>
          <Text style={[styles.offlineText, { color: C.gold }]}>
            ⊗ Offline — captures will sync when reconnected
          </Text>
        </View>
      )}
    </BottomSheet>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Common spacers
  marginTop12: {
    marginTop: 12,
  },

  // Mode tabs
  modeTabsScroll: {
    maxHeight: 64,
  },
  modeTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(185, 194, 217, 0.15)',
    gap: 5,
  },
  modeTabIcon: {
    fontSize: 14,
  },
  modeTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Mode panel
  modePanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  modeContent: {
    flex: 1,
  },

  // Voice mode
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    borderRadius: 14,
    marginTop: 8,
  },
  recordBtnIcon: {
    fontSize: 22,
  },
  recordBtnLabel: {
    color: '#EEF2FF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  recordingActive: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recordingTime: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  recordingHint: {
    fontSize: 12,
    letterSpacing: 1,
  },
  stopBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  stopBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  processingState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  processingText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  transcriptContainer: {
    gap: 10,
    paddingTop: 8,
  },
  transcriptLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  // Shared confirm/discard
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmBtnText: {
    color: '#EEF2FF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  discardBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  discardBtnText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  // Error / retry
  errorState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Text input
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    backgroundColor: 'rgba(7, 7, 18, 0.4)',
  },
  textInputMeeting: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 160,
    backgroundColor: 'rgba(7, 7, 18, 0.4)',
    lineHeight: 22,
  },

  // Paste mode
  pasteHint: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // Meeting mode
  meetingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  // Photo mode
  photoPickBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  photoPickIcon: {
    fontSize: 32,
  },
  photoPickLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  photoPickHint: {
    fontSize: 11,
    textAlign: 'center',
  },
  photoPreview: {
    gap: 10,
  },
  photoPreviewLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Check-in specific
  checkInPrompt: {
    color: C.starlight,
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  checkInBtnTextActive: {
    color: '#070712',
  },
  checkInBtnTextDisabled: {
    color: '#888',
  },

  // Success banner
  successBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
  },

  successText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Offline banner
  offlineBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(246, 193, 119, 0.12)',
  },

  offlineText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

export default CaptureDrawer;
