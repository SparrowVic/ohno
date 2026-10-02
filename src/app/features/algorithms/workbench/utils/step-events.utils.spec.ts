import { describe, expect, it } from 'vitest';

import { SortStep } from '../../models/sort-step';
import { BUBBLE_HISTORY, sortStep } from './step-events.fixture';
import { classifyStepEvents, countStepEvents, hasFamilySlot } from './step-events.utils';

describe('classifyStepEvents', () => {
  it('classifies a bubble sort history without explicit phases', () => {
    const events = classifyStepEvents(BUBBLE_HISTORY);
    expect(events.map((event) => event.kind)).toEqual(['start', 'compare', 'swap', 'compare', 'pass', 'complete']);
    expect(events.map((event) => event.pass)).toEqual([0, 0, 0, 0, 1, 1]);
  });

  it('prints compare and swap details with the values at their pre-swap indices', () => {
    const events = classifyStepEvents(BUBBLE_HISTORY);
    expect(events[1]?.detail).toBe('56[0] : 13[1]');
    expect(events[2]?.detail).toBe('56[0] ↔ 13[1]');
    expect(events[3]?.detail).toBe('74[2] : 35[3]');
    expect(events[4]?.detail).toBe('');
  });

  it('honours an explicit pass-complete phase even when sorted does not grow', () => {
    const events = classifyStepEvents([
      sortStep({ array: [1, 2] }),
      sortStep({ array: [1, 2], comparing: [0, 1] }),
      sortStep({ array: [1, 2], phase: 'pass-complete' }),
      sortStep({ array: [1, 2], sorted: [0, 1] }),
    ]);
    expect(events.map((event) => event.kind)).toEqual(['start', 'compare', 'pass', 'complete']);
  });

  it('keeps string advances and mid-run family completions out of the pass and end markers', () => {
    const tape = { mode: 'rle' } as unknown as NonNullable<SortStep['string']>;
    const network = { mode: 'dinic' } as unknown as NonNullable<SortStep['network']>;
    const events = classifyStepEvents([
      sortStep({ array: [] }),
      sortStep({ array: [], phase: 'pass-complete', string: tape }),
      sortStep({ array: [], phase: 'complete', network }),
      sortStep({ array: [], phase: 'pass-complete', network }),
      sortStep({ array: [], phase: 'complete', network }),
    ]);
    expect(events.map((event) => event.kind)).toEqual(['start', 'step', 'step', 'pass', 'complete']);
  });

  it('recognises steps that carry a family slot', () => {
    expect(hasFamilySlot(sortStep({ array: [1] }))).toBe(false);
    expect(hasFamilySlot(sortStep({ array: [], search: {} as NonNullable<SortStep['search']> }))).toBe(true);
  });

  it('reports a settle when everything becomes sorted before the final step', () => {
    const events = classifyStepEvents([
      sortStep({ array: [1, 2, 3] }),
      sortStep({ array: [1, 2, 3], sorted: [0, 1, 2] }),
      sortStep({ array: [1, 2, 3], sorted: [0, 1, 2] }),
    ]);
    expect(events.map((event) => event.kind)).toEqual(['start', 'settle', 'complete']);
  });

  it('returns no events for an empty history', () => {
    expect(classifyStepEvents([])).toEqual([]);
  });
});

describe('countStepEvents', () => {
  const events = classifyStepEvents(BUBBLE_HISTORY);

  it('counts only up to the cursor', () => {
    expect(countStepEvents(events, 3)).toEqual({ comparisons: 2, swaps: 1, passes: 0 });
  });

  it('counts the whole run at the last step', () => {
    expect(countStepEvents(events, 5)).toEqual({ comparisons: 2, swaps: 1, passes: 1 });
  });

  it('counts nothing before the first step', () => {
    expect(countStepEvents(events, -1)).toEqual({ comparisons: 0, swaps: 0, passes: 0 });
  });
});
