import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { knuthDpOptimizationGenerator } from './knuth-dp-optimization';
import type { SortStep } from '../models/sort-step';
import type { KnuthDpScenario } from '../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: KnuthDpScenario): SortStep[] {
  return [...knuthDpOptimizationGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('knuth-dp-optimization', () => {
  it('recovers one optimal merge plan from the restricted split windows', () => {
    const steps = collectSteps({
      kind: 'knuth-dp-optimization',
      presetId: 'spec-files',
      presetLabel: 'Spec Files',
      presetDescription: 'Three files with a unique cheapest merge order.',
      files: [10, 20, 30],
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.knuthDpOptimization.labels.resultCost',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(90);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.knuthDpOptimization.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.value).toBe('((F1 + F2) + F3)');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.knuthDpOptimization.phases.traceSplit',
      ),
    ).toBe(true);
  });
});
