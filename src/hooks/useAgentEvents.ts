import { useEffect, useRef } from 'react';
import {
  agentEventBus,
  AgentEventName,
  AgentEventPayloads,
} from '../services/AgentEventBus';

/**
 * useAgentEvents
 *
 * Subscribe to AgentEventBus events from a React component.
 * Automatically unsubscribes on unmount to prevent memory leaks.
 *
 * Uses a ref to always call the latest listener without re-subscribing,
 * preventing stale closures while maintaining stable subscription lifecycle.
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
  // Store the latest listener in a ref to avoid stale closures
  const listenerRef = useRef(listener);

  // Update the ref whenever the listener changes
  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const unsubscribe = agentEventBus.on(event, (payload) => {
      listenerRef.current(payload);
    });
    return unsubscribe;
  }, [event]);
}
