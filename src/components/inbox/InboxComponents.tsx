import React from 'react';
import {
    View,
    Text,
    Pressable,
    Animated,
    Easing,
} from 'react-native';
import { CaptureItem, CaptureStatus } from '../../services/CaptureService';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export type FilterTab = 'all' | CaptureStatus;

export const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unreviewed', label: 'Unreviewed' },
    { key: 'promoted', label: 'Promoted' },
    { key: 'discarded', label: 'Discarded' },
];

export const SOURCE_LABELS: Record<string, string> = {
    voice: '🎙 Voice',
    text: '✏️ Text',
    photo: '📷 Photo',
    paste: '📋 Paste',
    meeting: '📝 Meeting',
};

// ============================================================================
// HELPERS
// ============================================================================

export function formatRelativeTime(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) {
        return 'just now';
    }
    if (mins < 60) {
        return `${mins}m ago`;
    }
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) {
        return `${hrs}h ago`;
    }
    return `${Math.floor(hrs / 24)}d ago`;
}

export function getStatusBadgeStyle(
    status: CaptureStatus,
    isCosmic: boolean,
    styles: any,
): object {
    if (status === 'promoted') {
        return isCosmic
            ? styles.statusBadgePromotedCosmic
            : styles.statusBadgePromotedLinear;
    }
    return isCosmic
        ? styles.statusBadgeDiscardedCosmic
        : styles.statusBadgeDiscardedLinear;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function CaptureSkeleton({
    isCosmic,
    styles,
}: {
    isCosmic: boolean;
    styles: any;
}) {
    const opacity = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        anim.start();
        return () => anim.stop();
    }, [opacity]);

    const bgStyle = isCosmic ? styles.skeletonBgCosmic : styles.skeletonBgLinear;
    const blockStyle = isCosmic
        ? styles.skeletonBlockCosmic
        : styles.skeletonBlockLinear;

    return (
        <View style={[styles.row, bgStyle]}>
            {/* Meta */}
            <View style={styles.rowMeta}>
                <Animated.View
                    style={[styles.skeletonBadge, blockStyle, { opacity }]}
                />
                <Animated.View style={[styles.skeletonTime, blockStyle, { opacity }]} />
            </View>

            {/* Content */}
            <View style={styles.skeletonContent}>
                <Animated.View
                    style={[styles.skeletonText, blockStyle, styles.w90, { opacity }]}
                />
                <Animated.View
                    style={[styles.skeletonText, blockStyle, styles.w60, { opacity }]}
                />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <Animated.View style={[styles.skeletonBtn, blockStyle, { opacity }]} />
                <Animated.View style={[styles.skeletonBtn, blockStyle, { opacity }]} />
            </View>
        </View>
    );
}

interface CaptureRowProps {
    item: CaptureItem;
    onPromoteTask: (id: string) => void;
    onPromoteNote: (id: string) => void;
    onDiscard: (id: string) => void;
    isCosmic: boolean;
    styles: any;
}

export function CaptureRow({
    item,
    onPromoteTask,
    onPromoteNote,
    onDiscard,
    isCosmic,
    styles,
}: CaptureRowProps): JSX.Element {
    const isUnreviewed = item.status === 'unreviewed';

    return (
        <View
            testID={`capture-row-${item.id}`}
            style={[
                styles.row,
                isCosmic ? styles.rowCosmic : styles.rowLinear,
                !isUnreviewed && styles.rowReviewed,
            ]}
        >
            {/* Source badge + timestamp */}
            <View style={styles.rowMeta}>
                <Text
                    style={[styles.sourceBadge, isCosmic && styles.sourceBadgeCosmic]}
                >
                    {SOURCE_LABELS[item.source] ?? item.source}
                </Text>
                <Text style={[styles.timestamp, isCosmic && styles.timestampCosmic]}>
                    {formatRelativeTime(item.createdAt)}
                </Text>
                {item.status !== 'unreviewed' && (
                    <Text
                        style={[
                            styles.statusBadge,
                            getStatusBadgeStyle(item.status, isCosmic, styles),
                        ]}
                    >
                        {item.status.toUpperCase()}
                    </Text>
                )}
            </View>

            {/* Raw content */}
            <Text
                style={[styles.rawText, isCosmic && styles.rawTextCosmic]}
                numberOfLines={3}
            >
                {item.transcript ?? item.raw}
            </Text>

            {/* Actions (only shown when unreviewed) */}
            {isUnreviewed && (
                <View style={styles.actions}>
                    <Pressable
                        testID={`promote-task-${item.id}`}
                        onPress={() => onPromoteTask(item.id)}
                        style={({ pressed }) => [
                            styles.actionBtn,
                            isCosmic
                                ? styles.actionBtnTaskCosmic
                                : styles.actionBtnTaskLinear,
                            pressed && styles.actionBtnPressed,
                        ]}
                        accessibilityLabel="Promote to task"
                    >
                        <Text
                            style={[
                                styles.actionBtnText,
                                isCosmic && styles.actionBtnTextCosmic,
                            ]}
                        >
                            → Task
                        </Text>
                    </Pressable>

                    <Pressable
                        testID={`promote-note-${item.id}`}
                        onPress={() => onPromoteNote(item.id)}
                        style={({ pressed }) => [
                            styles.actionBtn,
                            isCosmic
                                ? styles.actionBtnNoteCosmic
                                : styles.actionBtnNoteLinear,
                            pressed && styles.actionBtnPressed,
                        ]}
                        accessibilityLabel="Promote to note"
                    >
                        <Text
                            style={[
                                styles.actionBtnText,
                                isCosmic && styles.actionBtnTextCosmic,
                            ]}
                        >
                            → Note
                        </Text>
                    </Pressable>

                    <Pressable
                        testID={`discard-${item.id}`}
                        onPress={() => onDiscard(item.id)}
                        style={({ pressed }) => [
                            styles.actionBtn,
                            isCosmic
                                ? styles.actionBtnDiscardCosmic
                                : styles.actionBtnDiscardLinear,
                            pressed && styles.actionBtnPressed,
                        ]}
                        accessibilityLabel="Discard"
                    >
                        <Text style={[styles.actionBtnText, styles.actionBtnTextDiscard]}>
                            Discard
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}
