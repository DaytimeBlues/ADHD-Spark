import { useState, useCallback, useEffect, useRef } from 'react';
import CaptureService, { CaptureSource } from '../services/CaptureService';
import { LoggerService } from '../services/LoggerService';
import type { BubbleState } from '../components/capture/CaptureBubble';

export type DrawerMode = CaptureSource | 'task';

export interface UseCaptureDrawerProps {
    visible: boolean;
    onClose: () => void;
    onStateChange: (state: BubbleState) => void;
    currentBubbleState: BubbleState;
}

export function useCaptureDrawer({
    visible,
    onClose,
    onStateChange,
    currentBubbleState,
}: UseCaptureDrawerProps) {
    const [activeMode, setActiveMode] = useState<DrawerMode>('task');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (visible && currentBubbleState === 'needs-checkin') {
            setActiveMode('checkin');
        }
    }, [visible, currentBubbleState]);

    // Cleanup success timeout on unmount
    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    const showSuccess = useCallback(
        (msg: string) => {
            setSuccessMsg(msg);
            successTimeoutRef.current = setTimeout(() => {
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
                LoggerService.error({
                    service: 'CaptureDrawer',
                    operation: 'saveCapture',
                    message: 'Failed to save capture',
                    error: err,
                    context: { source },
                });
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

    return {
        activeMode,
        setActiveMode,
        successMsg,
        saveError,
        isSaving,
        showSuccess,
        handleVoiceCapture,
        handleTextCapture,
        handlePasteCapture,
        handleMeetingCapture,
        handleCheckInCapture,
        handlePhotoCapture,
    };
}
