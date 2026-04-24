import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { longestIncreasingSubsequenceGenerator } from './longest-increasing-subsequence';
import type { SortStep } from '../../models/sort-step';
import type { LisScenario } from '../../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: LisScenario): SortStep[] {
  return [...longestIncreasingSubsequenceGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
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
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.resultLength',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(4);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.longestIncreasingSubsequence.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.values).toBe('2 → 5 → 7 → 101');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.chooseEndpoint',
      ),
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

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(1);
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.values).toBe('5');
    expect(
      steps.filter(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.longestIncreasingSubsequence.phases.backtrackPath',
      ).length,
    ).toBe(1);
  });
});
