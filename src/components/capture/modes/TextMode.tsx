import React, { memo, useState, useCallback } from 'react';
import { View, TextInput } from 'react-native';
import { RuneButton } from '../../../ui/cosmic/RuneButton';
import { C } from '../CaptureStyles';

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
        if (!trimmed) return;
        onCapture(trimmed);
        setText('');
    }, [text, onCapture]);

    return (
        <View style={styles.modeContent}>
            <TextInput
                testID="capture-text-input"
                style={[styles.textInput, { color: C.starlight, borderColor: C.border }]}
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
