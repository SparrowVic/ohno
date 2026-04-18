import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import { binarySearchVariantsGenerator } from './binary-search-variants';

function collectSteps(args: {
  readonly array: readonly number[];
  readonly target: number;
}): SortStep[] {
  return [...binarySearchVariantsGenerator(args)];
}

describe('binary-search-variants', () => {
  it('finds the full duplicated range with lower and upper bound passes', () => {
    const steps = collectSteps({
      array: [1, 2, 2, 2, 3],
      target: 2,
    });

    expect(steps.some((step) => step.search?.modeLabel === 'Upper bound')).toBe(true);
    expect(
      steps.some((step) => step.search?.statusLabel === 'First match candidate'),
    ).toBe(true);
    expect(
      steps.some((step) => step.search?.statusLabel === 'Last match candidate'),
    ).toBe(true);
    expect(steps.at(-1)?.search?.statusLabel).toBe('Range found');
    expect(steps.at(-1)?.search?.leftBound).toBe(1);
    expect(steps.at(-1)?.search?.rightBound).toBe(3);
    expect(steps.at(-1)?.search?.resultIndices).toEqual([1, 2, 3]);
  });

  it('returns early when the lower-bound pass never finds the target', () => {
    const steps = collectSteps({
      array: [1, 1, 3, 4],
      target: 2,
    });

    expect(steps.at(-1)?.search?.statusLabel).toBe('Not found');
    expect(steps.at(-1)?.search?.decision).toBe('lower bound search failed');
    expect(steps.at(-1)?.search?.resultIndices).toEqual([]);
    expect(steps.some((step) => step.search?.modeLabel === 'Upper bound')).toBe(false);
  });
});
