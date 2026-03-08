/**
 * InboxScreen
 *
 * Triage screen for captured items. Every capture lands here before being
 * promoted to a task/note or discarded. Supports filter tabs:
 * All | Unreviewed | Promoted | Discarded
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import CaptureService, {
  CaptureItem,
  CaptureStatus,
} from '../services/CaptureService';
import { LoggerService } from '../services/LoggerService';
import { CosmicBackground } from '../ui/cosmic';
import {
  CaptureRow,
  CaptureSkeleton,
  FILTER_TABS,
  type FilterTab,
} from './inbox/inboxParts';
import { styles } from './inbox/inboxStyles';

// ============================================================================
// SCREEN
// ============================================================================

const InboxScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { isCosmic } = useTheme();

  const [items, setItems] = useState<CaptureItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  const loadItems = useCallback(async (): Promise<void> => {
    if (isMountedRef.current) {
      setIsLoading(true);
    }

    try {
      const filter =
        activeFilter === 'all'
          ? undefined
          : { status: activeFilter as CaptureStatus };
      const result = await CaptureService.getAll(filter);
      if (isMountedRef.current) {
        setItems(result);
      }
    } catch (error) {
      LoggerService.error({
        service: 'InboxScreen',
        operation: 'loadItems',
        message: 'Failed to load items',
        error,
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [activeFilter]);

  useEffect(() => {
    isMountedRef.current = true;
    loadItems();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadItems]);

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
      LoggerService.error({
        service: 'InboxScreen',
        operation: 'handlePromoteTask',
        message: 'Failed to promote task',
        error,
        context: { id },
      });
    }
  }, []);

  const handlePromoteNote = useCallback(async (id: string): Promise<void> => {
    try {
      await CaptureService.promote(id, 'note');
    } catch (error) {
      LoggerService.error({
        service: 'InboxScreen',
        operation: 'handlePromoteNote',
        message: 'Failed to promote note',
        error,
        context: { id },
      });
    }
  }, []);

  const handleDiscard = useCallback(async (id: string): Promise<void> => {
    try {
      await CaptureService.discard(id);
    } catch (error) {
      LoggerService.error({
        service: 'InboxScreen',
        operation: 'handleDiscard',
        message: 'Failed to discard item',
        error,
        context: { id },
      });
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
    <CosmicBackground variant="ridge" style={styles.container}>
      <SafeAreaView
        style={[styles.container, isCosmic ? styles.bgCosmic : styles.bgLinear]}
        testID="inbox-screen"
        accessibilityLabel="Inbox screen"
        accessibilityRole="summary"
      >
        {/* Header */}
        <View style={[styles.header, isCosmic && styles.headerCosmic]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            testID="inbox-close"
            accessibilityLabel="Close inbox"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.closeBtnText,
                isCosmic && styles.closeBtnTextCosmic,
              ]}
            >
              X
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
          <View style={styles.listContent}>
            {[1, 2, 3].map((key) => (
              <CaptureSkeleton key={key} isCosmic={isCosmic} />
            ))}
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centered} testID="inbox-empty">
            <Text
              style={[styles.emptyText, isCosmic && styles.emptyTextCosmic]}
            >
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
    </CosmicBackground>
  );
};

export default InboxScreen;
