import { useState, useEffect } from 'react';
import CaptureService from '../services/CaptureService';

/**
 * useUnreviewedCount
 *
 * Custom hook for tracking the number of unreviewed items in the Brain Dump.
 * Optimizes UI by centralizing the count update logic.
 */
export function useUnreviewedCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Initial fetch
        CaptureService.getUnreviewedCount().then(setCount);

        // Subscribe to updates
        return CaptureService.subscribe(() => {
            CaptureService.getUnreviewedCount().then(setCount);
        });
    }, []);

    return count;
}
