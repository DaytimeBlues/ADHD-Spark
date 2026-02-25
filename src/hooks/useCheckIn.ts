import { useState, useEffect } from 'react';
import { CheckInService } from '../services/CheckInService';

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
