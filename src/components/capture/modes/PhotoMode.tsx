import React, { memo, useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { RuneButton } from '../../../ui/cosmic/RuneButton';
import { isWeb } from '../../../utils/PlatformUtils';
import { C } from '../CaptureStyles';

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
            const doc = (globalThis as any).document;
            if (!doc) return;
            const input = doc.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                    const uri = URL.createObjectURL(file as Blob);
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
                    <Text style={[styles.photoPreviewLabel, { color: C.mutedText }]}>📷 Photo selected</Text>
                    <TextInput
                        testID="capture-text-input"
                        style={[styles.textInput, { color: C.starlight, borderColor: C.border }]}
                        value={caption}
                        onChangeText={setCaption}
                        placeholder="Add a caption (optional)…"
                        placeholderTextColor={C.mutedText}
                        accessibilityLabel="Photo caption input"
                    />
                    <RuneButton onPress={handleConfirm} variant="primary" style={styles.marginTop12}>
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
                    <Text style={[styles.photoPickLabel, { color: C.violet }]}>SELECT PHOTO</Text>
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
