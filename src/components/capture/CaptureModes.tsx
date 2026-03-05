import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import RecordingService from '../../services/RecordingService';
import { LoggerService } from '../../services/LoggerService';
import { RuneButton } from '../../ui/cosmic/RuneButton';
import { useTaskStore } from '../../store/useTaskStore';
import { isWeb } from '../../utils/PlatformUtils';
import type { BubbleState } from './CaptureBubble';

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

export const MEETING_TEMPLATE = (now: Date): string => {
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

// Cosmic colors (shared locally for components)
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
    styles: any;
}

export const VoiceMode = memo(function VoiceMode({
    onCapture,
    onStateChange,
    styles,
}: VoiceModeProps) {
    const [phase, setPhase] = useState<
        'idle' | 'recording' | 'processing' | 'done' | 'error'
    >('idle');
    const [elapsedMs, setElapsedMs] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
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
                <RuneButton
                    variant="primary"
                    onPress={handleStartRecording}
                    leftIcon={<Text style={styles.recordBtnIcon}>🎙</Text>}
                    style={styles.recordBtn}
                >
                    TAP TO RECORD
                </RuneButton>
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
                    <RuneButton
                        variant="secondary"
                        size="md"
                        onPress={handleStopRecording}
                        style={[styles.stopBtn, { borderColor: C.teal }]}
                    >
                        STOP
                    </RuneButton>
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
                        <RuneButton
                            variant="primary"
                            onPress={handleConfirm}
                            style={styles.confirmBtn}
                        >
                            SAVE TO INBOX
                        </RuneButton>
                        <RuneButton
                            variant="danger"
                            onPress={handleDiscard}
                            style={styles.discardBtn}
                        >
                            DISCARD
                        </RuneButton>
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
    styles: any;
}

export const TextMode = memo(function TextMode({
    onCapture,
    styles,
}: TextModeProps) {
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
            <RuneButton
                onPress={handleConfirm}
                disabled={!text.trim()}
                variant="primary"
                style={styles.marginTop12}
            >
                SAVE TO INBOX
            </RuneButton>
        </View>
    );
});

// ============================================================================
// PASTE MODE
// ============================================================================

interface PasteModeProps {
    onCapture: (raw: string) => void;
    styles: any;
}

export const PasteMode = memo(function PasteMode({
    onCapture,
    styles,
}: PasteModeProps) {
    const [text, setText] = useState('');
    const [isPasting, setIsPasting] = useState(false);

    const handleAutoPaste = useCallback(async () => {
        setIsPasting(true);
        try {
            if (isWeb) {
                const webNavigator = navigator as typeof navigator & {
                    clipboard?: { readText: () => Promise<string> };
                };
                if (webNavigator.clipboard) {
                    const pasted = await webNavigator.clipboard.readText();
                    setText(pasted);
                }
            } else {
                setText('');
            }
        } catch (err) {
            LoggerService.error({
                service: 'CaptureDrawer',
                operation: 'handleAutoPaste',
                message: 'Clipboard read error',
                error: err,
            });
        } finally {
            setIsPasting(false);
        }
    }, []);

    useEffect(() => {
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
                    <RuneButton
                        onPress={handleConfirm}
                        disabled={!text.trim()}
                        variant="primary"
                        style={styles.marginTop12}
                    >
                        SAVE TO INBOX
                    </RuneButton>
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
    styles: any;
}

export const MeetingMode = memo(function MeetingMode({
    onCapture,
    styles,
}: MeetingModeProps) {
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
            <RuneButton
                onPress={handleConfirm}
                variant="primary"
                style={styles.marginTop12}
            >
                SAVE MEETING NOTES
            </RuneButton>
        </View>
    );
});

// ============================================================================
// PHOTO MODE
// ============================================================================

interface PhotoModeProps {
    onCapture: (raw: string, attachmentUri?: string) => void;
    styles: any;
}

export const PhotoMode = memo(function PhotoMode({
    onCapture,
    styles,
}: PhotoModeProps) {
    const [selectedUri, setSelectedUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');

    const handlePickFile = useCallback(() => {
        if (isWeb) {
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
                    <RuneButton
                        onPress={handleConfirm}
                        variant="primary"
                        style={styles.marginTop12}
                    >
                        SAVE TO INBOX
                    </RuneButton>
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
                    {!isWeb && (
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
    styles: any;
}

export const CheckInMode = memo(function CheckInMode({
    onCapture,
    styles,
}: CheckInModeProps) {
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
            <RuneButton
                onPress={handleConfirm}
                disabled={!text.trim()}
                variant={text.trim() ? 'primary' : 'secondary'}
                style={styles.marginTop12}
            >
                LOG PROGRESS
            </RuneButton>
        </View>
    );
});

// ============================================================================
// TASK MODE
// ============================================================================

interface TaskModeProps {
    onSuccess: () => void;
    styles: any;
}

export const TaskMode = memo(function TaskMode({
    onSuccess,
    styles,
}: TaskModeProps) {
    const [title, setTitle] = useState('');
    const addTaskStore = useTaskStore((state) => state.addTask);

    const handleConfirm = useCallback(() => {
        const trimmed = title.trim();
        if (!trimmed) {
            return;
        }
        addTaskStore({
            title: trimmed,
            priority: 'normal',
            source: 'manual',
        });
        setTitle('');
        onSuccess();
    }, [title, addTaskStore, onSuccess]);

    return (
        <View style={styles.modeContent}>
            <Text style={[styles.meetingLabel, { color: C.mutedText }]}>
                NEW MISSION
            </Text>
            <TextInput
                testID="capture-task-input"
                style={[
                    styles.textInput,
                    { color: C.starlight, borderColor: C.border },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="What needs to be done?"
                placeholderTextColor={C.mutedText}
                multiline
                autoFocus
                numberOfLines={2}
                textAlignVertical="top"
                accessibilityLabel="Task title input"
            />
            <RuneButton
                variant="primary"
                onPress={handleConfirm}
                disabled={!title.trim()}
                style={styles.marginTop12}
            >
                ADD TASK
            </RuneButton>
        </View>
    );
});
