# Vibe Coding: Building Production-Grade Software with GenAI

> *"Vibe coding is building software by feel — but shipping it like craft."*

This document is the living companion to the `vibe-coding` branch of Spark ADHD. It captures decisions, patterns, and lessons learned while building with modern GenAI primitives. Think of it as the book in code form.

---

## The Philosophy

Vibe coding isn't about being fast and sloppy. It's about maintaining **creative momentum** while building things that are actually good. The moment you start wrestling with architecture feels like the moment you lose the thread. The goal here is to design systems that stay out of your way.

For GenAI features specifically, this means:

- **Never block the user** — AI is additive. If it's down, the core app still works.
- **Be honest about uncertainty** — Surface error states with meaning, not generic toasts.
- **Local data stays local** — Don't send raw personal data to the server. Summarise. Anonymise.
- **Agents act, humans confirm** — Give agents tools, but route actions through an event bus so humans can intercept.

---

## Architecture Decisions

### AI Provider Strategy

| Provider | When | Trade-off |
|---|---|---|
| `vercel` (default) | API key is private, no CORS risk | Requires server round-trip |
| `gemini-direct` | Set `REACT_APP_GEMINI_API_KEY` | Faster, but key is in bundle |

The `config.aiProvider` field controls which path is taken. If `REACT_APP_AI_PROVIDER=vercel` is explicitly set, it always wins — even if a Gemini key is present.

### Error Codes vs. Generic Messages

`AISortService` now exports an `AiSortErrorCode` discriminated union (`AI_NETWORK`, `AI_TIMEOUT`, `AI_INVALID_RESPONSE`, `AI_SERVER_ERROR`, `AI_UNKNOWN`). This lets the UI say:

- "You're offline" — not just "something went wrong"
- "The server took too long" — with a retry button
- "We got a weird response" — with a file-a-bug link

### The EventBus Pattern (Agent Actions)

External AI agents (registered via `WebMCPService` / WebMCP API) don't navigate the app directly. Instead, they call tools that emit typed events onto `AgentEventBus`. React components subscribe with `useAgentEvents`.

This means:

- Zero coupling between `WebMCPService` and React navigation
- Easy to add/remove agent tools without touching screens
- Subscribing components can add confirmation dialogs before acting

```
Agent → WebMCPService.tool() → agentEventBus.emit() → useAgentEvents() → React screen
```

### Graceful Degradation Hierarchy

1. **AI responds** → show AI result
2. **AI times out / network error** → show sensible fallback (default micro-steps, no insight)
3. **Cache hit** → skip the round-trip entirely

The user should never see a blank screen or a crash caused by AI.

---

## Available Tools (WebMCP)

When running in a WebMCP-capable browser, external agents can call:

| Tool | Description |
|---|---|
| `start_timer` | Start a pomodoro / ignite / anchor timer |
| `navigate_to_screen` | Navigate to any named screen |
| `add_brain_dump` | Write to the brain dump list |
| `create_fog_cutter_task` | Pre-fill a task for micro-step breakdown |
| `read_check_ins` | Read last N check-in records |
| `get_app_state` | Get time-of-day and last check-in |

### Testing in DevTools

```js
// In Chrome DevTools console:
await globalThis.navigator.modelContext.callTool('start_timer', { timerType: 'ignite' })
await globalThis.navigator.modelContext.callTool('navigate_to_screen', { screen: 'BrainDump' })
```

---

## New Services

| Service | Purpose |
|---|---|
| `AISortService` | Hardened brain dump sorter (retry, cache, timeout) |
| `FogCutterAIService` | Generates 3–5 micro-steps from a vague task |
| `CheckInInsightService` | Produces personalised insight from local check-in data |
| `AgentEventBus` | Typed pub/sub bridge between agents and React |
| `WebMCPService` | Registers tools for external AI agents |

---

## What's Next (Future Branches)

- **Chat screen** (`ChatScreen.tsx`) — conversational Spark coach with streaming
- **Gemini Nano / window.ai** — on-device inference for `CheckInInsightService`
- **Agent confirmation dialogs** — let users preview and approve agent actions before they execute
- **Voice input** — connect PlaudService transcripts to FogCutter AI
