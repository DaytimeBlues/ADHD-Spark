import { useState, useEffect } from 'react';
import { BiometricService } from '../services/BiometricService';

/**
 * useBiometric
 *
 * Custom hook for managing biometric authentication state.
 * Syncs with BiometricService and provides simplified access to auth actions.
 */
export function useBiometric() {
    const [isUnlocked, setIsUnlocked] = useState(true); // Default to true while service inits

    useEffect(() => {
        return BiometricService.subscribe((unlocked) => {
            setIsUnlocked(unlocked);
        });
    }, []);

    return {
        isUnlocked,
        authenticate: () => BiometricService.authenticate(),
        toggleSecurity: (enabled: boolean) => BiometricService.toggleSecurity(enabled),
        isSecured: BiometricService.getIsSecured(),
    };
}
