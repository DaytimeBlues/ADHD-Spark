# ADR 003: Service Layer Split For External Integrations

- Status: Accepted
- Date: 2026-03-05

## Context

Large integration services (OAuth/sync/capture) grew into monolithic modules, increasing regression risk and slowing review cycles.

## Decision

Split integration logic into focused service units:

- auth/token lifecycle
- API client transport
- sync orchestration and queueing
- UI-facing orchestration through hooks

## Consequences

- Pros:
  - smaller, testable units
  - clearer ownership of failure handling
  - faster parallel implementation in branch-based streams
- Cons:
  - temporary increase in file/module count
  - merge coordination required across parallel workers
