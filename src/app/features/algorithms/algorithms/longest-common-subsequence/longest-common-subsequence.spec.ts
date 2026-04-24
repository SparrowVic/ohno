import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { longestCommonSubsequenceGenerator } from './longest-common-subsequence';
import type { SortStep } from '../../models/sort-step';
import type { LcsScenario } from '../../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: LcsScenario): SortStep[] {
  return [...longestCommonSubsequenceGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('longest-common-subsequence', () => {
  it('reconstructs the final subsequence after filling the DP grid', () => {
    const steps = collectSteps({
      kind: 'longest-common-subsequence',
      presetId: 'spec-ac',
      presetLabel: 'Spec AC',
      presetDescription: 'Short pair with a clean diagonal subsequence.',
      source: 'ABC',
      target: 'ADC',
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.longestCommonSubsequence.labels.resultLength',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(2);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.longestCommonSubsequence.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.value).toBe('AC');
    expect(
      steps.filter(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.longestCommonSubsequence.phases.backtrackMatch',
      ).length,
    ).toBe(2);
  });

  it('prefers the upward backtrack branch when top and left are tied', () => {
    const steps = collectSteps({
      kind: 'longest-common-subsequence',
      presetId: 'spec-tie',
      presetLabel: 'Spec Tie',
      presetDescription: 'Tie case should follow the upward branch first.',
      source: 'AB',
      target: 'BA',
    });

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(1);
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.value).toBe('A');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.longestCommonSubsequence.phases.backtrackUpward',
      ),
    ).toBe(true);
  });
});
