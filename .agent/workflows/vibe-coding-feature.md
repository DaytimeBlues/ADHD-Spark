---
description: create a new vibe-coding AI feature with hardened service layer and agentic loop
---

# Vibe Coding Feature Workflow

1. Define the AI Service Interface in `src/services/`.
   - Use `AbortController` for timeouts (default 8s from `config`).
   - Implement exponential backoff retry (3x).
   - Add in-memory or `AsyncStorage` caching if results are stable.
   - Use discriminated unions for specific error codes.

2. Update `src/config/index.ts` if new environment variables or timeouts are needed.

3. Create typed events in `src/services/AgentEventBus.ts`.
   - Add its name and payload type to `AgentEventName` and `AgentEventPayloads`.

4. Register the feature as a tool in `src/services/WebMCPService.ts`.
   - Use `navigator.modelContext.registerTool`.
   - Emit the event to the `AgentEventBus`.

5. Build the React UI in `src/screens/`.
   - Subcribe to agent events with `useAgentEvents`.
   - Handle loading/error states explicitly using the hardened service error codes.

6. Add unit tests in `__tests__/services/`.
   - Verify retry logic, cache hits, and timeout handling.

7. Update `docs/VIBE_CODING.md` with the new service and tool details.
