import { useState, useEffect } from 'react';
import RetentionService, {
    ReentryPromptLevel,
} from '../services/RetentionService';

export function useRetention() {
    const [streak, setStreak] = useState(0);
    const [reentryLevel, setReentryLevel] =
        useState<ReentryPromptLevel>('none');

    useEffect(() => {
        const checkState = async () => {
            const currentStreak = await RetentionService.markAppUse();
            const level = await RetentionService.getReentryPromptLevel();
            setStreak(currentStreak);
            setReentryLevel(level);
        };

        checkState();
    }, []);

    return {
        streak,
        reentryLevel,
    };
}
