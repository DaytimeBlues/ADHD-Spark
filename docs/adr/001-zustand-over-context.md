# ADR 001: Zustand Over React Context For App State

- Status: Accepted
- Date: 2026-03-05

## Context

The app has multiple independently updated state domains (tasks, timer, capture, theme) with cross-screen usage and persistence requirements.

## Decision

Use Zustand stores as the primary app-state container instead of a single large React Context reducer.

## Consequences

- Pros:
  - fine-grained selectors reduce unnecessary rerenders
  - straightforward store persistence and hydration
  - easier targeted unit testing of store actions
- Cons:
  - risk of side effects leaking into stores if boundaries are not enforced
  - additional discipline needed to keep business logic in services/hooks
