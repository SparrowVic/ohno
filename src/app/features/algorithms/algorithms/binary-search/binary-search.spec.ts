import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import { binarySearchGenerator } from './binary-search';

function collectSteps(args: {
  readonly array: readonly number[];
  readonly target: number;
}): SortStep[] {
  return [...binarySearchGenerator(args)];
}

describe('binary-search', () => {
  it('shrinks the window toward the hit and reports the collapsed index', () => {
    const steps = collectSteps({
      array: [1, 3, 5, 7, 9],
      target: 7,
    });

    const moveRightStep = steps.find((step) => step.search?.statusLabel === 'Move right');

    expect(moveRightStep?.search?.eliminated).toEqual([0, 1, 2]);
    expect(steps.at(-1)?.search?.resultIndices).toEqual([3]);
    expect(steps.at(-1)?.search?.visitedOrder).toEqual([2, 3]);
    expect(steps.at(-1)?.search?.low).toBe(3);
    expect(steps.at(-1)?.search?.high).toBe(3);
  });

  it('ends with an empty candidate window when the target is absent', () => {
    const steps = collectSteps({
      array: [1, 3, 5, 7, 9],
      target: 6,
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.search?.statusLabel).toBe('Not found');
    expect(steps.at(-1)?.search?.decision).toBe('candidate window became empty');
    expect(steps.some((step) => step.search?.statusLabel === 'Move right')).toBe(true);
    expect(steps.some((step) => step.search?.statusLabel === 'Move left')).toBe(true);
  });
});
