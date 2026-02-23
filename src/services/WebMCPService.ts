import { Platform } from 'react-native';
import StorageService from './StorageService';
import { agentEventBus } from './AgentEventBus';

type ToolDefinition = {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
  execute: unknown;
};

type ModelContextLike = {
  registerTool?: (tool: ToolDefinition) => void;
};

type WebMCPNavigatorLike = {
  modelContext?: ModelContextLike;
};

type BrainDumpEntry = {
  id: string;
  text: string;
  timestamp: number;
  type: string;
  [key: string]: unknown;
};

type CheckInEntry = Record<string, unknown>;

/**
 * WebMCPService
 *
 * Registers tools for external AI agents when the app runs in a
 * WebMCP-capable browser (navigator.modelContext API).
 *
 * All tool executions emit events via AgentEventBus so React screens
 * can react without coupling directly to this service.
 */
class WebMCPService {
  private isInitialized = false;

  public init() {
    if (this.isInitialized || Platform.OS !== 'web') {
      return;
    }

    const registerTools = () => {
      const modelContext = (globalThis as { navigator?: WebMCPNavigatorLike })
        .navigator?.modelContext;
      if (!modelContext?.registerTool) {
        console.log('WebMCP: API not found, retrying...');
        return;
      }

      console.log('WebMCP: Registering tools...');

      // ── 1. Start Timer ────────────────────────────────────────────────────
      modelContext.registerTool({
        name: 'start_timer',
        description:
          'Navigates to and starts a specific focus or breathing timer.',
        parameters: {
          type: 'object',
          properties: {
            timerType: {
              type: 'string',
              enum: ['pomodoro', 'ignite', 'anchor'],
              description: 'The type of timer to start',
            },
          },
          required: ['timerType'],
        },
        execute: async ({
          timerType,
        }: {
          timerType: 'pomodoro' | 'ignite' | 'anchor';
        }) => {
          agentEventBus.emit('timer:start', { timerType });
          agentEventBus.emit('navigate:screen', { screen: timerType });
          return { success: true, message: `${timerType} timer requested` };
        },
      });

      // ── 2. Navigate to Screen ─────────────────────────────────────────────
      modelContext.registerTool({
        name: 'navigate_to_screen',
        description: 'Navigates the app to the specified screen.',
        parameters: {
          type: 'object',
          properties: {
            screen: {
              type: 'string',
              enum: [
                'Home',
                'Ignite',
                'Pomodoro',
                'Anchor',
                'BrainDump',
                'FogCutter',
                'CheckIn',
                'Calendar',
                'Chat',
              ],
              description: 'The screen to navigate to',
            },
          },
          required: ['screen'],
        },
        execute: async ({ screen }: { screen: string }) => {
          agentEventBus.emit('navigate:screen', { screen });
          return { success: true, screen };
        },
      });

      // ── 3. Add Brain Dump Item ────────────────────────────────────────────
      modelContext.registerTool({
        name: 'add_brain_dump',
        description: "Adds a new item to the user's brain dump list.",
        parameters: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The text content to save',
            },
          },
          required: ['text'],
        },
        execute: async ({ text }: { text: string }) => {
          try {
            const items =
              (await StorageService.getJSON<BrainDumpEntry[]>(
                StorageService.STORAGE_KEYS.brainDump,
              )) || [];
            const newItem = {
              id: Date.now().toString(),
              text,
              timestamp: Date.now(),
              type: 'text',
            };
            await StorageService.setJSON(
              StorageService.STORAGE_KEYS.brainDump,
              [newItem, ...items],
            );
            agentEventBus.emit('braindump:add', { text });
            return { success: true, item: newItem };
          } catch (error) {
            return { success: false, error: String(error) };
          }
        },
      });

      // ── 4. Create Fog Cutter Task ─────────────────────────────────────────
      modelContext.registerTool({
        name: 'create_fog_cutter_task',
        description:
          'Seeds the Fog Cutter screen with a task title so the user can break it down.',
        parameters: {
          type: 'object',
          properties: {
            taskTitle: {
              type: 'string',
              description: 'The task title to break down',
            },
          },
          required: ['taskTitle'],
        },
        execute: async ({ taskTitle }: { taskTitle: string }) => {
          agentEventBus.emit('fogcutter:create', { taskTitle });
          agentEventBus.emit('navigate:screen', { screen: 'FogCutter' });
          return { success: true, taskTitle };
        },
      });

      // ── 5. Read Check-Ins ─────────────────────────────────────────────────
      modelContext.registerTool({
        name: 'read_check_ins',
        description:
          "Returns the user's last N check-in entries (mood, energy, timestamp).",
        parameters: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of check-ins to return (max 7)',
            },
          },
        },
        execute: async ({ limit = 7 }: { limit?: number }) => {
          try {
            const entries =
              (await StorageService.getJSON<CheckInEntry[]>('checkIns')) || [];
            return {
              success: true,
              entries: entries.slice(0, Math.min(limit, 7)),
            };
          } catch {
            return { success: false, entries: [] };
          }
        },
      });

      // ── 6. Get App State ──────────────────────────────────────────────────
      modelContext.registerTool({
        name: 'get_app_state',
        description:
          "Returns a lightweight snapshot of the app's current state (time of day, last check-in mood).",
        parameters: { type: 'object', properties: {} },
        execute: async () => {
          const hour = new Date().getHours();
          const timeOfDay =
            hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

          try {
            const checkIns =
              (await StorageService.getJSON<CheckInEntry[]>('checkIns')) || [];
            const lastCheckIn = checkIns[0] ?? null;
            return { success: true, timeOfDay, lastCheckIn };
          } catch {
            return { success: true, timeOfDay, lastCheckIn: null };
          }
        },
      });

      this.isInitialized = true;
      console.log('WebMCP: Tools registered successfully');
    };

    registerTools();
    setTimeout(registerTools, 1000);
    setTimeout(registerTools, 3000);
  }
}

export default new WebMCPService();
