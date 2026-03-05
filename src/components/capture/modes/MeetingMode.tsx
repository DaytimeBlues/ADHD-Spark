import React, { memo, useState, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import { RuneButton } from '../../../ui/cosmic/RuneButton';
import { C } from '../CaptureStyles';

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
        if (!trimmed) return;
        onCapture(trimmed);
        setNotes(MEETING_TEMPLATE(new Date()));
    }, [notes, onCapture]);

    return (
        <View style={styles.modeContent}>
            <Text style={[styles.meetingLabel, { color: C.mutedText }]}>MEETING NOTES</Text>
            <TextInput
                testID="capture-meeting-input"
                style={[styles.textInputMeeting, { color: C.starlight, borderColor: C.border }]}
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
