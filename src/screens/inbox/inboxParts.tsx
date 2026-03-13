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
import type { ThemeVariant } from '../../theme/themeVariant';
import type { ThemeTokens } from '../../theme/types';
import { getInboxStyles } from './inboxStyles';

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

export function CaptureSkeleton({
  variant,
  t,
}: {
  variant: ThemeVariant;
  t: ThemeTokens;
}) {
  const styles = getInboxStyles(variant, t);
  const opacity = React.useRef(new Animated.Value(0.3)).current;
  const useNativeDriver = Platform.OS !== 'web';
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';

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

  const bgStyle = isNightAwe
    ? styles.skeletonBgNightAwe
    : isCosmic
      ? styles.skeletonBgCosmic
      : styles.skeletonBgLinear;
  const blockStyle = isNightAwe
    ? styles.skeletonBlockNightAwe
    : isCosmic
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
  variant: ThemeVariant;
  t: ThemeTokens;
}

export function CaptureRow({
  item,
  onPromoteTask,
  onPromoteNote,
  onDiscard,
  variant,
  t,
}: CaptureRowProps): JSX.Element {
  const styles = getInboxStyles(variant, t);
  const isUnreviewed = item.status === 'unreviewed';
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';

  return (
    <View
      testID={`capture-row-${item.id}`}
      style={[
        styles.row,
        isNightAwe
          ? styles.rowNightAwe
          : isCosmic
            ? styles.rowCosmic
            : styles.rowLinear,
        !isUnreviewed && styles.rowReviewed,
      ]}
    >
      <View style={styles.rowMeta}>
        <Text
          style={[
            styles.sourceBadge,
            isNightAwe
              ? styles.sourceBadgeNightAwe
              : isCosmic && styles.sourceBadgeCosmic,
          ]}
        >
          {SOURCE_LABELS[item.source] ?? item.source}
        </Text>
        <Text
          style={[
            styles.timestamp,
            isNightAwe
              ? styles.timestampNightAwe
              : isCosmic && styles.timestampCosmic,
          ]}
        >
          {formatRelativeTime(item.createdAt)}
        </Text>
        {item.status !== 'unreviewed' && (
          <Text
            style={[
              styles.statusBadge,
              getStatusBadgeStyle(item.status, variant, styles),
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        )}
      </View>

      <Text
        style={[
          styles.rawText,
          isNightAwe
            ? styles.rawTextNightAwe
            : isCosmic && styles.rawTextCosmic,
        ]}
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
                : isNightAwe
                  ? styles.actionBtnTaskNightAwe
                  : styles.actionBtnTaskLinear,
              pressed && styles.actionBtnPressed,
            ]}
            accessibilityLabel="Promote to task"
          >
            <Text
              style={[
                styles.actionBtnText,
                isNightAwe
                  ? styles.actionBtnTextNightAwe
                  : isCosmic && styles.actionBtnTextCosmic,
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
                : isNightAwe
                  ? styles.actionBtnNoteNightAwe
                  : styles.actionBtnNoteLinear,
              pressed && styles.actionBtnPressed,
            ]}
            accessibilityLabel="Promote to note"
          >
            <Text
              style={[
                styles.actionBtnText,
                isNightAwe
                  ? styles.actionBtnTextNightAwe
                  : isCosmic && styles.actionBtnTextCosmic,
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
                : isNightAwe
                  ? styles.actionBtnDiscardNightAwe
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

function getStatusBadgeStyle(
  status: CaptureStatus,
  variant: ThemeVariant,
  styles: ReturnType<typeof getInboxStyles>,
) {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';
  if (status === 'promoted') {
    return isNightAwe
      ? styles.statusBadgePromotedNightAwe
      : isCosmic
        ? styles.statusBadgePromotedCosmic
        : styles.statusBadgePromotedLinear;
  }

  return isNightAwe
    ? styles.statusBadgeDiscardedNightAwe
    : isCosmic
      ? styles.statusBadgeDiscardedCosmic
      : styles.statusBadgeDiscardedLinear;
}
