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
    setCount(CaptureService.getUnreviewedCount());

    // Subscribe to updates
    const unsubscribe = CaptureService.subscribe((newCount) => {
      setCount(newCount);
    });
    return () => unsubscribe();
  }, []);

  return count;
}
