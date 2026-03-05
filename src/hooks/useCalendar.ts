import { useState, useCallback, useEffect } from 'react';
import { GoogleTasksSyncService } from '../services/PlaudService';
import { isWeb } from '../utils/PlatformUtils';

export type CalendarConnectionStatus =
    | 'checking'
    | 'connected'
    | 'disconnected'
    | 'unsupported';

export function useCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [connectionStatus, setConnectionStatus] =
        useState<CalendarConnectionStatus>('checking');
    const [isConnecting, setIsConnecting] = useState(false);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
        );
    };

    const nextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
        );
    };

    const refreshCalendarConnectionStatus = useCallback(async () => {
        if (isWeb) {
            setConnectionStatus('unsupported');
            return;
        }

        try {
            const scopes = await GoogleTasksSyncService.getCurrentUserScopes();
            const hasCalendarScope = Boolean(
                scopes?.includes('https://www.googleapis.com/auth/calendar.events'),
            );
            setConnectionStatus(hasCalendarScope ? 'connected' : 'disconnected');
        } catch (error) {
            setConnectionStatus('disconnected');
        }
    }, []);

    useEffect(() => {
        refreshCalendarConnectionStatus();
    }, [refreshCalendarConnectionStatus]);

    const handleConnectGoogleCalendar = useCallback(async () => {
        if (
            connectionStatus === 'unsupported' ||
            connectionStatus === 'checking' ||
            isConnecting
        ) {
            return;
        }

        setIsConnecting(true);
        try {
            await GoogleTasksSyncService.signInInteractive();
        } finally {
            await refreshCalendarConnectionStatus();
            setIsConnecting(false);
        }
    }, [connectionStatus, isConnecting, refreshCalendarConnectionStatus]);

    const statusTextByConnectionStatus: Record<CalendarConnectionStatus, string> =
    {
        checking: 'STATUS: CHECKING...',
        connected: 'STATUS: CONNECTED',
        disconnected: 'STATUS: NOT CONNECTED',
        unsupported: 'STATUS: NOT AVAILABLE ON WEB',
    };

    const buttonTextByConnectionStatus: Record<CalendarConnectionStatus, string> =
    {
        checking: 'CHECKING...',
        connected: 'CONNECTED',
        disconnected: 'CONNECT GOOGLE CALENDAR',
        unsupported: 'WEB UNSUPPORTED',
    };

    const isConnectButtonDisabled =
        connectionStatus === 'connected' ||
        connectionStatus === 'unsupported' ||
        connectionStatus === 'checking' ||
        isConnecting;

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysArray = Array(daysInMonth)
        .fill(0)
        .map((_, i) => i + 1);

    return {
        currentDate,
        connectionStatus,
        isConnecting,
        daysArray,
        firstDay,
        prevMonth,
        nextMonth,
        handleConnectGoogleCalendar,
        statusTextByConnectionStatus,
        buttonTextByConnectionStatus,
        isConnectButtonDisabled,
    };
}
