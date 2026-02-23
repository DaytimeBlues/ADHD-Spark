/**
 * InboxScreen
 *
 * Triage screen for captured items. Every capture lands here before being
 * promoted to a task/note or discarded. Supports filter tabs:
 * All | Unreviewed | Promoted | Discarded
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Tokens } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { LinearTokens } from '@/theme/linearTokens';
import CaptureService, {
  CaptureItem,
  CaptureStatus,
} from '@/services/CaptureService';

// ============================================================================
// TYPES
// ============================================================================

type FilterTab = 'all' | CaptureStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unreviewed', label: 'Unreviewed' },
  { key: 'promoted', label: 'Promoted' },
  { key: 'discarded', label: 'Discarded' },
];

const SOURCE_LABELS: Record<string, string> = {
  voice: '🎙 Voice',
  text: '✏️ Text',
  photo: '📷 Photo',
  paste: '📋 Paste',
  meeting: '📝 Meeting',
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CaptureRowProps {
  item: CaptureItem;
  onPromoteTask: (id: string) => void;
  onPromoteNote: (id: string) => void;
  onDiscard: (id: string) => void;
  isCosmic: boolean;
}

function CaptureRow({
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
              getStatusBadgeStyle(item.status, isCosmic),
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

// ============================================================================
// HELPERS
// ============================================================================

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

function getStatusBadgeStyle(status: CaptureStatus, isCosmic: boolean): object {
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
// SCREEN
// ============================================================================

const InboxScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { isCosmic, t } = useTheme();
  const lt = t as typeof LinearTokens;

  const [items, setItems] = useState<CaptureItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('unreviewed');
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async (): Promise<void> => {
    try {
      const filter =
        activeFilter === 'all'
          ? undefined
          : { status: activeFilter as CaptureStatus };
      const result = await CaptureService.getAll(filter);
      setItems(result);
    } catch (error) {
      console.error('[InboxScreen] loadItems error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    CaptureService.getAll(
      activeFilter === 'all'
        ? undefined
        : { status: activeFilter as CaptureStatus },
    )
      .then((result) => {
        if (isMounted) {
          setItems(result);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('[InboxScreen] load error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activeFilter]);

  // Subscribe to badge changes to refresh list reactively
  useEffect(() => {
    const unsub = CaptureService.subscribe(() => {
      loadItems();
    });
    return unsub;
  }, [loadItems]);

  const handlePromoteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await CaptureService.promote(id, 'task');
    } catch (error) {
      console.error('[InboxScreen] promote task error:', error);
    }
  }, []);

  const handlePromoteNote = useCallback(async (id: string): Promise<void> => {
    try {
      await CaptureService.promote(id, 'note');
    } catch (error) {
      console.error('[InboxScreen] promote note error:', error);
    }
  }, []);

  const handleDiscard = useCallback(async (id: string): Promise<void> => {
    try {
      await CaptureService.discard(id);
    } catch (error) {
      console.error('[InboxScreen] discard error:', error);
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CaptureItem }) => (
      <CaptureRow
        item={item}
        onPromoteTask={handlePromoteTask}
        onPromoteNote={handlePromoteNote}
        onDiscard={handleDiscard}
        isCosmic={isCosmic}
      />
    ),
    [handlePromoteTask, handlePromoteNote, handleDiscard, isCosmic],
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isCosmic ? '#070712' : lt.colors.neutral.darkest },
      ]}
      testID="inbox-screen"
    >
      {/* Header */}
      <View style={[styles.header, isCosmic && styles.headerCosmic]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          testID="inbox-close"
          accessibilityLabel="Close inbox"
        >
          <Text
            style={[styles.closeBtnText, isCosmic && styles.closeBtnTextCosmic]}
          >
            ✕
          </Text>
        </Pressable>
        <Text style={[styles.title, isCosmic && styles.titleCosmic]}>
          CAPTURE INBOX
        </Text>
        <View style={styles.closeBtnPlaceholder} />
      </View>

      {/* Filter tabs */}
      <View
        style={[styles.tabs, isCosmic && styles.tabsCosmic]}
        testID="inbox-filter-tabs"
      >
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveFilter(tab.key)}
            style={[
              styles.tab,
              activeFilter === tab.key &&
                (isCosmic ? styles.tabActiveCosmic : styles.tabActiveLinear),
            ]}
            testID={`inbox-tab-${tab.key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeFilter === tab.key }}
          >
            <Text
              style={[
                styles.tabText,
                isCosmic && styles.tabTextCosmic,
                activeFilter === tab.key &&
                  (isCosmic
                    ? styles.tabTextActiveCosmic
                    : styles.tabTextActiveLinear),
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={isCosmic ? '#8B5CF6' : lt.colors.indigo.primary}
          />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered} testID="inbox-empty">
          <Text style={[styles.emptyText, isCosmic && styles.emptyTextCosmic]}>
            {activeFilter === 'unreviewed'
              ? 'Nothing to review.\nCapture something with the bubble!'
              : 'No items here yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          testID="inbox-list"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing[4],
    paddingVertical: Tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.borderSubtle,
  },
  headerCosmic: {
    borderBottomColor: 'rgba(185, 194, 217, 0.12)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: Tokens.colors.text.secondary,
  },
  closeBtnTextCosmic: {
    color: '#B9C2D9',
  },
  closeBtnPlaceholder: {
    width: 36,
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: 'none' } as object,
    }),
  },
  titleCosmic: {
    color: '#EEF2FF',
    fontFamily: 'Space Grotesk',
    ...Platform.select({
      web: {
        textShadow: '0 0 16px rgba(139, 92, 246, 0.3)',
      } as object,
    }),
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.borderSubtle,
    backgroundColor: Tokens.colors.neutral.darker,
  },
  tabsCosmic: {
    backgroundColor: '#0B1022',
    borderBottomColor: 'rgba(42, 53, 82, 0.3)',
  },
  tab: {
    flex: 1,
    paddingVertical: Tokens.spacing[3],
    alignItems: 'center',
  },
  tabActiveLinear: {
    borderBottomWidth: 2,
    borderBottomColor: Tokens.colors.indigo.primary,
  },
  tabActiveCosmic: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    color: Tokens.colors.text.tertiary,
    letterSpacing: 0.5,
  },
  tabTextCosmic: {
    color: '#6B7A9C',
  },
  tabTextActiveLinear: {
    color: Tokens.colors.indigo.primary,
  },
  tabTextActiveCosmic: {
    color: '#8B5CF6',
  },
  listContent: {
    padding: Tokens.spacing[4],
    gap: Tokens.spacing[3],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing[8],
  },
  emptyText: {
    fontFamily: Tokens.type.fontFamily.body,
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyTextCosmic: {
    color: '#6B7A9C',
  },
  // Row
  row: {
    borderRadius: 8,
    padding: Tokens.spacing[4],
    borderWidth: 1,
    gap: Tokens.spacing[3],
  },
  rowLinear: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  rowCosmic: {
    backgroundColor: 'rgba(17, 26, 51, 0.7)',
    borderColor: 'rgba(185, 194, 217, 0.12)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow:
          '0 0 0 1px rgba(139, 92, 246, 0.06), 0 4px 16px rgba(7, 7, 18, 0.3)',
      } as object,
    }),
  },
  rowReviewed: {
    opacity: 0.65,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing[2],
    flexWrap: 'wrap',
  },
  sourceBadge: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    color: Tokens.colors.brand[500],
    backgroundColor: Tokens.colors.neutral.dark,
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sourceBadgeCosmic: {
    color: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  timestamp: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.tertiary,
  },
  timestampCosmic: {
    color: '#6B7A9C',
  },
  statusBadge: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  statusBadgePromotedLinear: {
    color: Tokens.colors.success.main,
    backgroundColor: Tokens.colors.success.subtle,
  },
  statusBadgePromotedCosmic: {
    color: '#2DD4BF',
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
  },
  statusBadgeDiscardedLinear: {
    color: Tokens.colors.error.main,
    backgroundColor: Tokens.colors.error.subtle,
  },
  statusBadgeDiscardedCosmic: {
    color: '#FB7185',
    backgroundColor: 'rgba(251, 113, 133, 0.1)',
  },
  rawText: {
    fontFamily: Tokens.type.fontFamily.body,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.primary,
    lineHeight: 20,
  },
  rawTextCosmic: {
    color: '#B9C2D9',
  },
  actions: {
    flexDirection: 'row',
    gap: Tokens.spacing[2],
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: Tokens.spacing[3],
    paddingVertical: Tokens.spacing[1],
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  actionBtnTaskLinear: {
    borderColor: Tokens.colors.indigo.primary,
    backgroundColor: Tokens.colors.indigo.subtle,
  },
  actionBtnTaskCosmic: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  actionBtnNoteLinear: {
    borderColor: Tokens.colors.brand[400],
    backgroundColor: 'transparent',
  },
  actionBtnNoteCosmic: {
    borderColor: '#B9C2D9',
    backgroundColor: 'rgba(185, 194, 217, 0.08)',
  },
  actionBtnDiscardLinear: {
    borderColor: Tokens.colors.error.main,
    backgroundColor: 'transparent',
  },
  actionBtnDiscardCosmic: {
    borderColor: 'rgba(251, 113, 133, 0.4)',
    backgroundColor: 'transparent',
  },
  actionBtnText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    color: Tokens.colors.text.primary,
    letterSpacing: 0.3,
  },
  actionBtnTextCosmic: {
    color: '#EEF2FF',
  },
  actionBtnTextDiscard: {
    color: Tokens.colors.error.main,
  },
});

export default InboxScreen;
