import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import { linearSearchGenerator } from './linear-search';

function collectSteps(args: {
  readonly array: readonly number[];
  readonly target: number;
}): SortStep[] {
  return [...linearSearchGenerator(args)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('linear-search', () => {
  it('stops on the first hit and preserves visited and eliminated slots', () => {
    const steps = collectSteps({
      array: [4, 2, 7],
      target: 2,
    });

    expect(steps.map((step) => step.phase)).toEqual([
      'init',
      'compare',
      'pass-complete',
      'compare',
      'complete',
    ]);
    expect(steps[2]?.search?.eliminated).toEqual([0]);
    expect(steps.at(-1)?.search?.resultIndices).toEqual([1]);
    expect(steps.at(-1)?.search?.visitedOrder).toEqual([0, 1]);
    expect(steps.at(-1)?.search?.rows[1]?.status).toBe('found');
  });

  it('finishes with a not-found state after exhausting the full array', () => {
    const steps = collectSteps({
      array: [1, 3],
      target: 2,
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.search?.statusLabel)).toBe(
      'features.algorithms.runtime.search.linearSearch.statuses.notFound',
    );
    expect(keyOf(steps.at(-1)?.search?.decision)).toBe(
      'features.algorithms.runtime.search.linearSearch.decisions.allSlotsExhausted',
    );
    expect(steps.at(-1)?.search?.visitedOrder).toEqual([0, 1]);
    expect(steps.at(-1)?.search?.eliminated).toEqual([0, 1]);
  });
});
