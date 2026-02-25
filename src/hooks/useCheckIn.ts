import { useState, useEffect } from 'react';
import { CheckInService } from '../services/CheckInService';

/**
 * useCheckIn
 *
 * Custom hook for monitoring the daily check-in status.
 * Provides real-time updates on whether a check-in is pending.
 */
export function useCheckIn() {
    const [isPending, setIsPending] = useState(CheckInService.isPending());

    useEffect(() => {
        return CheckInService.subscribe((pending) => {
            setIsPending(pending);
        });
    }, []);

    return {
        isPending,
        setPending: (status: boolean) => CheckInService.setPending(status),
        start: (interval?: number) => CheckInService.start(interval),
        stop: () => CheckInService.stop(),
    };
}
