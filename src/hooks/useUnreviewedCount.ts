import { useState, useEffect } from 'react';
import CaptureService from '../services/CaptureService';

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
