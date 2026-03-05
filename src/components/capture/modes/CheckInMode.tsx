import React, { memo, useState, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import { RuneButton } from '../../../ui/cosmic/RuneButton';
import { C } from '../CaptureStyles';

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
        if (!trimmed) return;
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
                style={[styles.textInput, { color: C.starlight, borderColor: C.border }]}
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
