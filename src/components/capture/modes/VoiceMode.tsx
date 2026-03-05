import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import RecordingService from '../../../services/RecordingService';
import { RuneButton } from '../../../ui/cosmic/RuneButton';
import type { BubbleState } from '../CaptureBubble';
import { C } from '../CaptureStyles';

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
    const [phase, setPhase] = useState<'idle' | 'recording' | 'processing' | 'done' | 'error'>('idle');
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
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleStartRecording = useCallback(async () => {
        setErrorMsg('');
        const granted = await RecordingService.requestPermissions();
        if (!granted) {
            setPhase('error');
            setErrorMsg('Microphone permission denied.');
            return;
        }
        const started = await RecordingService.startRecording();
        if (!started) {
            setPhase('error');
            setErrorMsg('Could not start recording.');
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
            setErrorMsg('Recording failed.');
            onStateChange('idle');
            return;
        }
        const rawText = `[Voice note — ${Math.round(result.duration / 1000)}s recording]`;
        setTranscript(rawText);
        setPhase('done');
        onStateChange('idle');
    }, [stopTimer, onStateChange]);

    const handleConfirm = useCallback(() => onCapture(transcript, transcript), [onCapture, transcript]);

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
                    <View style={[styles.recordingIndicator, { backgroundColor: C.teal }]} />
                    <Text style={[styles.recordingTime, { color: C.teal }]}>{elapsed}</Text>
                    <Text style={[styles.recordingHint, { color: C.mutedText }]}>Recording…</Text>
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
                    <Text style={[styles.processingText, { color: C.mutedText }]}>Processing…</Text>
                </View>
            )}

            {phase === 'done' && (
                <View style={styles.transcriptContainer}>
                    <Text style={[styles.transcriptLabel, { color: C.mutedText }]}>CAPTURED</Text>
                    <Text style={[styles.transcriptText, { color: C.starlight }]}>{transcript}</Text>
                    <View style={styles.confirmRow}>
                        <RuneButton variant="primary" onPress={handleConfirm} style={styles.confirmBtn}>SAVE TO INBOX</RuneButton>
                        <RuneButton variant="danger" onPress={handleDiscard} style={styles.discardBtn}>DISCARD</RuneButton>
                    </View>
                </View>
            )}

            {phase === 'error' && (
                <View style={styles.errorState}>
                    <Text style={[styles.errorText, { color: C.rose }]}>{errorMsg}</Text>
                    <Pressable
                        style={[styles.retryBtn, { borderColor: C.violet }]}
                        onPress={() => { setPhase('idle'); setErrorMsg(''); }}
                        accessibilityLabel="Try again"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.retryBtnText, { color: C.violet }]}>TRY AGAIN</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
});
