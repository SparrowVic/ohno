import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import { binarySearchGenerator } from './binary-search';

function collectSteps(args: {
  readonly array: readonly number[];
  readonly target: number;
}): SortStep[] {
  return [...binarySearchGenerator(args)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('binary-search', () => {
  it('shrinks the window toward the hit and reports the collapsed index', () => {
    const steps = collectSteps({
      array: [1, 3, 5, 7, 9],
      target: 7,
    });

    const moveRightStep = steps.find(
      (step) =>
        keyOf(step.search?.statusLabel) ===
        'features.algorithms.runtime.search.binarySearch.statuses.moveRight',
    );

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
    expect(keyOf(steps.at(-1)?.search?.statusLabel)).toBe(
      'features.algorithms.runtime.search.binarySearch.statuses.notFound',
    );
    expect(keyOf(steps.at(-1)?.search?.decision)).toBe(
      'features.algorithms.runtime.search.binarySearch.decisions.candidateWindowEmpty',
    );
    expect(
      steps.some(
        (step) =>
          keyOf(step.search?.statusLabel) ===
          'features.algorithms.runtime.search.binarySearch.statuses.moveRight',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.search?.statusLabel) ===
          'features.algorithms.runtime.search.binarySearch.statuses.moveLeft',
      ),
    ).toBe(true);
  });
});
