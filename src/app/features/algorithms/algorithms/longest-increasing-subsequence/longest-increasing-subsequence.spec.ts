import { describe, expect, it } from 'vitest';

import { longestIncreasingSubsequenceGenerator } from './longest-increasing-subsequence';
import type { SortStep } from '../../models/sort-step';
import type { LisScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: LisScenario): SortStep[] {
  return [...longestIncreasingSubsequenceGenerator(scenario)];
}

describe('longest-increasing-subsequence', () => {
  it('recovers one longest increasing subsequence from a classic benchmark input', () => {
    const steps = collectSteps({
      kind: 'longest-increasing-subsequence',
      presetId: 'spec-benchmark',
      presetLabel: 'Spec Benchmark',
      presetDescription: 'Classic LIS benchmark with a stable first best endpoint.',
      values: [10, 9, 2, 5, 3, 7, 101, 18],
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.dp?.resultLabel).toBe('len = 4');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('LIS: 2 → 5 → 7 → 101');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Choose best endpoint'),
    ).toBe(true);
  });

  it('keeps the first element as the only LIS in a strictly decreasing array', () => {
    const steps = collectSteps({
      kind: 'longest-increasing-subsequence',
      presetId: 'spec-decreasing',
      presetLabel: 'Spec Decreasing',
      presetDescription: 'No extension should beat the first singleton subsequence.',
      values: [5, 4, 3],
    });

    expect(steps.at(-1)?.dp?.resultLabel).toBe('len = 1');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('LIS: 5');
    expect(
      steps.filter((step) => step.dp?.phaseLabel === 'Backtrack LIS path').length,
    ).toBe(1);
  });
});
