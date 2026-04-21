import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { divideConquerDpOptimizationGenerator } from './divide-conquer-dp-optimization';
import type { SortStep } from '../models/sort-step';
import type { DivideConquerDpScenario } from '../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: DivideConquerDpScenario): SortStep[] {
  return [...divideConquerDpOptimizationGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('divide-conquer-dp-optimization', () => {
  it('recovers one optimal partition from the midpoint recursion', () => {
    const steps = collectSteps({
      kind: 'divide-conquer-dp-optimization',
      presetId: 'spec-groups',
      presetLabel: 'Spec Groups',
      presetDescription: 'Three values split into two groups with one best partition.',
      values: [1, 2, 3],
      groups: 2,
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.labels.resultCost',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(18);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.divideConquerDpOptimization.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.cuts).toBe('[1..2] | [3..3]');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.divideConquerDpOptimization.phases.backtrackSplits',
      ),
    ).toBe(true);
  });
});
