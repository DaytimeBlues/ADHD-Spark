import { LoggerService } from './LoggerService';

/**
 * AgentEventBus
 *
 * A lightweight singleton EventEmitter for broadcasting actions triggered by
 * external AI agents (via WebMCPService) to React screens without direct coupling.
 *
 * Screens and hooks subscribe to events; WebMCPService publishes them.
 */

type AgentEventName =
  | 'timer:start'
  | 'navigate:screen'
  | 'braindump:add'
  | 'fogcutter:create';

type AgentEventPayloads = {
  'timer:start': { timerType: 'pomodoro' | 'ignite' | 'anchor' };
  'navigate:screen': { screen: string };
  'braindump:add': { text: string };
  'fogcutter:create': { taskTitle: string };
};

type Listener<E extends AgentEventName> = (
  payload: AgentEventPayloads[E],
) => void;

class AgentEventBus {
  private readonly listeners = new Map<
    AgentEventName,
    Set<Listener<AgentEventName>>
  >();

  on<E extends AgentEventName>(event: E, listener: Listener<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as Listener<AgentEventName>);

    // Return an unsubscribe function for easy cleanup
    return () => {
      set.delete(listener as Listener<AgentEventName>);
    };
  }

  emit<E extends AgentEventName>(
    event: E,
    payload: AgentEventPayloads[E],
  ): void {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    set.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        LoggerService.error({
          service: 'AgentEventBus',
          operation: 'emit',
          message: `Error in listener for '${event}'`,
          error: err,
          context: { event },
        });
      }
    });
  }

  /** Remove all listeners for a given event (useful in tests). */
  removeAllListeners(event?: AgentEventName): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const agentEventBus = new AgentEventBus();
export type { AgentEventName, AgentEventPayloads };
