# Brain Dump Tutorial Guide

This guide explains how the Brain Dump tutorial works in the app and how to
verify it during development.

## What The Tutorial Does

The tutorial is a short onboarding flow for the Brain Dump screen. It explains:

- why Brain Dump exists,
- how to capture thoughts quickly,
- when to use AI sorting,
- and how to replay the guide later.

## User Behavior

- The tutorial opens automatically the first time a user visits Brain Dump.
- The tutorial can be replayed at any time with the `TOUR` button in the
  Brain Dump header.
- `Next` advances through the steps.
- `Previous` moves back one step.
- `Skip Tutorial` dismisses the flow and marks onboarding as complete.
- Finishing the last step also marks onboarding as complete.

## Storage

- Tutorial progress is persisted in the Zustand store key
  `spark-tutorial-storage`.
- The Brain Dump tutorial flow id is `brain-dump-onboarding`.

## QA Checklist

1. Launch the app and open the `TASKS` tab.
2. Confirm the tutorial overlay appears automatically.
3. Click `Next` and verify the step title changes.
4. Click `Previous` and verify the earlier step returns.
5. Click `Skip Tutorial` and confirm the overlay closes.
6. Click the `TOUR` button and confirm the tutorial reopens.
7. Finish the tutorial and reload the page.
8. Confirm the tutorial does not auto-open after completion.

## E2E Coverage

The Playwright smoke coverage for this feature should validate:

- first-run tutorial visibility,
- replay via the `TOUR` button,
- step navigation,
- and a successful capture bubble save flow into Inbox.
