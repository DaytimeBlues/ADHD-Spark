import {
  advanceTaskProgress,
  ensureSingleNext,
  getTaskProgressSummary,
  normalizeMicroSteps,
} from '../src/utils/fogCutter';

describe('fogCutter utils', () => {
  it('normalizes string steps and assigns only one next', () => {
    const steps = normalizeMicroSteps(['One', 'Two', 'Three']);

    expect(steps).toHaveLength(3);
    expect(steps[0].status).toBe('next');
    expect(steps[1].status).toBe('new');
    expect(steps[2].status).toBe('new');
  });

  it('collapses duplicate next states to a single next', () => {
    const normalized = ensureSingleNext([
      { id: 'a', text: 'A', status: 'next' },
      { id: 'b', text: 'B', status: 'next' },
      { id: 'c', text: 'C', status: 'new' },
    ]);

    const nextCount = normalized.filter(
      (step) => step.status === 'next',
    ).length;
    expect(nextCount).toBe(1);
    expect(normalized[1].status).toBe('new');
  });

  it('advances task micro-steps and marks completion when done', () => {
    const task = {
      completed: false,
      microSteps: normalizeMicroSteps(['Step 1', 'Step 2']),
    };

    const started = advanceTaskProgress(task);
    expect(started.microSteps[0].status).toBe('in_progress');

    const firstDone = advanceTaskProgress(started);
    expect(firstDone.microSteps[0].status).toBe('done');

    const secondStarted = advanceTaskProgress(firstDone);
    expect(secondStarted.microSteps[1].status).toBe('in_progress');

    const done = advanceTaskProgress(secondStarted);
    expect(done.completed).toBe(true);
    expect(getTaskProgressSummary(done.microSteps)).toBe('2/2 DONE');
  });
});
