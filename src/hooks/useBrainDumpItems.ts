import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutAnimation, Platform, AccessibilityInfo } from 'react-native';
import StorageService from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';
import { LoggerService } from '../services/LoggerService';
import OverlayService from '../services/OverlayService';
import { generateId } from '../utils/helpers';

const PERSIST_DEBOUNCE_MS = 300;
const OVERLAY_COUNT_DEBOUNCE_MS = 250;

export interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
  source: 'text' | 'audio';
  audioPath?: string;
}

interface UseBrainDumpItemsOptions {
  onFirstItemAdded?: () => void;
  guideDismissed: boolean;
}

interface UseBrainDumpItemsReturn {
  items: DumpItem[];
  isLoading: boolean;
  addItem: (
    text: string,
    source?: 'text' | 'audio',
    audioPath?: string,
  ) => void;
  deleteItem: (id: string) => void;
  clearAll: () => void;
  loadItems: () => Promise<void>;
}

export const useBrainDumpItems = ({
  onFirstItemAdded,
  guideDismissed,
}: UseBrainDumpItemsOptions): UseBrainDumpItemsReturn => {
  const [items, setItems] = useState<DumpItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasTrackedFirstItem = useRef(false);

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastOverlayCountRef = useRef<number>(0);

  // Load items on mount
  const loadItems = useCallback(async () => {
    try {
      const storedItems = await StorageService.getJSON<DumpItem[]>(
        StorageService.STORAGE_KEYS.brainDump,
      );

      if (storedItems && Array.isArray(storedItems)) {
        const normalized = storedItems.filter((item) => {
          return Boolean(item?.id && item?.text && item?.createdAt);
        });
        if (Platform.OS !== 'web') {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        setItems(normalized);
      }
    } catch (error) {
      LoggerService.error({
        service: 'BrainDumpItems',
        operation: 'loadItems',
        message: 'Failed to load items',
        error,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist items with debounce
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(
        StorageService.STORAGE_KEYS.brainDump,
        items,
      ).catch((error) =>
        LoggerService.error({
          service: 'BrainDumpItems',
          operation: 'persistItems',
          message: 'Failed to persist brain dump items',
          error,
          context: { itemCount: items.length },
        }),
      );
    }, PERSIST_DEBOUNCE_MS);

    if (items.length !== lastOverlayCountRef.current) {
      if (overlayCountTimerRef.current) {
        clearTimeout(overlayCountTimerRef.current);
      }

      overlayCountTimerRef.current = setTimeout(() => {
        OverlayService.updateCount(items.length);
        lastOverlayCountRef.current = items.length;
      }, OVERLAY_COUNT_DEBOUNCE_MS);
    }

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
      if (overlayCountTimerRef.current) {
        clearTimeout(overlayCountTimerRef.current);
      }
    };
  }, [items, isLoading]);

  const addItem = useCallback(
    (text: string, source: 'text' | 'audio' = 'text', audioPath?: string) => {
      if (Platform.OS !== 'web') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      const newItem: DumpItem = {
        id: generateId(),
        text,
        createdAt: new Date().toISOString(),
        source,
        ...(audioPath && { audioPath }),
      };
      setItems((prevItems) => {
        const next = [newItem, ...prevItems];
        if (!guideDismissed && !hasTrackedFirstItem.current) {
          UXMetricsService.track('brain_dump_first_item_added');
          hasTrackedFirstItem.current = true;
          onFirstItemAdded?.();
        }
        return next;
      });
    },
    [guideDismissed, onFirstItemAdded],
  );

  const deleteItem = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setItems([]);
    AccessibilityInfo.announceForAccessibility('All items cleared.');
  }, []);

  return {
    items,
    isLoading,
    addItem,
    deleteItem,
    clearAll,
    loadItems,
  };
};

export default useBrainDumpItems;
