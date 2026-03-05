import { useState, useCallback, useEffect } from 'react';
import CaptureService, {
    CaptureItem,
    CaptureStatus,
} from '../services/CaptureService';
import { LoggerService } from '../services/LoggerService';

export type FilterTab = 'all' | CaptureStatus;

export function useInbox(activeFilter: FilterTab) {
    const [items, setItems] = useState<CaptureItem[]>([]);
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
            LoggerService.error({
                service: 'InboxScreen',
                operation: 'loadItems',
                message: 'Failed to load items',
                error,
            });
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
                LoggerService.error({
                    service: 'InboxScreen',
                    operation: 'load',
                    message: 'Failed to load items',
                    error,
                });
                if (isMounted) {
                    setIsLoading(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [activeFilter]);

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

    return {
        items,
        isLoading,
        handlePromoteTask,
        handlePromoteNote,
        handleDiscard,
        loadItems,
    };
}
