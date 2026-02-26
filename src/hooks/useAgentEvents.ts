import { useEffect, useRef } from "react";
import {
  agentEventBus,
  AgentEventName,
  AgentEventPayloads,
} from "../services/AgentEventBus";

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
  const listenerRef = useRef(listener);

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
