import React, { memo, useState, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import { RuneButton } from '../../../ui/cosmic/RuneButton';
import { useTaskStore } from '../../../store/useTaskStore';
import { C } from '../CaptureStyles';

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
        if (!trimmed) return;
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
            <Text style={[styles.meetingLabel, { color: C.mutedText }]}>NEW MISSION</Text>
            <TextInput
                testID="capture-task-input"
                style={[styles.textInput, { color: C.starlight, borderColor: C.border }]}
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
