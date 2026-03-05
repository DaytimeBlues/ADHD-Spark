# ADR 002: Semantic Theme Token System

- Status: Accepted
- Date: 2026-03-05

## Context

Direct color literals and style constants made visual consistency, accessibility tuning, and theme changes expensive.

## Decision

Adopt semantic token usage as the default:

- use `theme`/token references for component colors and spacing
- reserve raw literals for token definition files and explicit token tests

## Consequences

- Pros:
  - centralized contrast and brand tuning
  - lower risk of style drift and "lazy AI default" hardcodes
  - easier global accessibility improvements
- Cons:
  - migration effort for legacy literals
  - temporary mixed state during rollout
