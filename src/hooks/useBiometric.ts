import { useState, useEffect } from 'react';
import { BiometricService } from '../services/BiometricService';

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
