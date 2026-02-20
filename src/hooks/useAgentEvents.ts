import { useEffect } from 'react';
import { agentEventBus, AgentEventName, AgentEventPayloads } from '../services/AgentEventBus';

/**
 * useAgentEvents
 *
 * Subscribe to AgentEventBus events from a React component.
 * Automatically unsubscribes on unmount to prevent memory leaks.
 *
 * @example
 * useAgentEvents('navigate:screen', ({ screen }) => {
 *   navigation.navigate(screen);
 * });
 */
export function useAgentEvents<E extends AgentEventName>(
    event: E,
    listener: (payload: AgentEventPayloads[E]) => void,
): void {
    useEffect(() => {
        const unsubscribe = agentEventBus.on(event, listener);
        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);
}
