import { describe, expect, it } from 'vitest';

import { longestCommonSubsequenceGenerator } from './longest-common-subsequence';
import type { SortStep } from '../../models/sort-step';
import type { LcsScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: LcsScenario): SortStep[] {
  return [...longestCommonSubsequenceGenerator(scenario)];
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('len = 2');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('LCS: AC');
    expect(
      steps.filter((step) => step.dp?.phaseLabel === 'Backtrack match').length,
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

    expect(steps.at(-1)?.dp?.resultLabel).toBe('len = 1');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('LCS: A');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Backtrack upward'),
    ).toBe(true);
  });
});
