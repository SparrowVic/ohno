import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import { binarySearchVariantsGenerator } from './binary-search-variants';

function collectSteps(args: {
  readonly array: readonly number[];
  readonly target: number;
}): SortStep[] {
  return [...binarySearchVariantsGenerator(args)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('binary-search-variants', () => {
  it('finds the full duplicated range with lower and upper bound passes', () => {
    const steps = collectSteps({
      array: [1, 2, 2, 2, 3],
      target: 2,
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.search?.modeLabel) ===
          'features.algorithms.runtime.search.binarySearchVariants.modeLabels.upperBound',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.search?.statusLabel) ===
          'features.algorithms.runtime.search.binarySearchVariants.statuses.firstMatchCandidate',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.search?.statusLabel) ===
          'features.algorithms.runtime.search.binarySearchVariants.statuses.lastMatchCandidate',
      ),
    ).toBe(true);
    expect(keyOf(steps.at(-1)?.search?.statusLabel)).toBe(
      'features.algorithms.runtime.search.binarySearchVariants.statuses.rangeFound',
    );
    expect(steps.at(-1)?.search?.leftBound).toBe(1);
    expect(steps.at(-1)?.search?.rightBound).toBe(3);
    expect(steps.at(-1)?.search?.resultIndices).toEqual([1, 2, 3]);
  });

  it('returns early when the lower-bound pass never finds the target', () => {
    const steps = collectSteps({
      array: [1, 1, 3, 4],
      target: 2,
    });

    expect(keyOf(steps.at(-1)?.search?.statusLabel)).toBe(
      'features.algorithms.runtime.search.binarySearchVariants.statuses.notFound',
    );
    expect(keyOf(steps.at(-1)?.search?.decision)).toBe(
      'features.algorithms.runtime.search.binarySearchVariants.decisions.lowerBoundSearchFailed',
    );
    expect(steps.at(-1)?.search?.resultIndices).toEqual([]);
    expect(
      steps.some(
        (step) =>
          keyOf(step.search?.modeLabel) ===
          'features.algorithms.runtime.search.binarySearchVariants.modeLabels.upperBound',
      ),
    ).toBe(false);
  });
});
