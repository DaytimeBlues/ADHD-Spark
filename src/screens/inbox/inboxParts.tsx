import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import type { CaptureItem, CaptureStatus } from '../../services/CaptureService';
import { styles } from './inboxStyles';

export type FilterTab = 'all' | CaptureStatus;

export const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'unreviewed', label: 'Unreviewed' },
  { key: 'promoted', label: 'Promoted' },
  { key: 'discarded', label: 'Discarded' },
];

const SOURCE_LABELS: Record<string, string> = {
  voice: 'Voice',
  text: 'Text',
  photo: 'Photo',
  paste: 'Paste',
  meeting: 'Meeting',
};

export function CaptureSkeleton({ isCosmic }: { isCosmic: boolean }) {
  const opacity = React.useRef(new Animated.Value(0.3)).current;
  const useNativeDriver = Platform.OS !== 'web';

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ]),
    );

    anim.start();
    return () => anim.stop();
  }, [opacity, useNativeDriver]);

  const bgStyle = isCosmic ? styles.skeletonBgCosmic : styles.skeletonBgLinear;
  const blockStyle = isCosmic
    ? styles.skeletonBlockCosmic
    : styles.skeletonBlockLinear;

  return (
    <View style={[styles.row, bgStyle]}>
      <View style={styles.rowMeta}>
        <Animated.View
          style={[styles.skeletonBadge, blockStyle, { opacity }]}
        />
        <Animated.View style={[styles.skeletonTime, blockStyle, { opacity }]} />
      </View>

      <View style={styles.skeletonContent}>
        <Animated.View
          style={[styles.skeletonText, blockStyle, styles.w90, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonText, blockStyle, styles.w60, { opacity }]}
        />
      </View>

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
}

export function CaptureRow({
  item,
  onPromoteTask,
  onPromoteNote,
  onDiscard,
  isCosmic,
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
              getStatusBadgeStyle(item.status, isCosmic),
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        )}
      </View>

      <Text
        style={[styles.rawText, isCosmic && styles.rawTextCosmic]}
        numberOfLines={3}
      >
        {item.transcript ?? item.raw}
      </Text>

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
              {'->'} Task
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
              {'->'} Note
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

function formatRelativeTime(ts: number): string {
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

function getStatusBadgeStyle(status: CaptureStatus, isCosmic: boolean) {
  if (status === 'promoted') {
    return isCosmic
      ? styles.statusBadgePromotedCosmic
      : styles.statusBadgePromotedLinear;
  }

  return isCosmic
    ? styles.statusBadgeDiscardedCosmic
    : styles.statusBadgeDiscardedLinear;
}
