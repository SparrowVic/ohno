import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { subsetSumGenerator } from './subset-sum';
import type { SortStep } from '../../models/sort-step';
import type { SubsetSumScenario } from '../../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: SubsetSumScenario): SortStep[] {
  return [...subsetSumGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('subset-sum', () => {
  it('backtracks one reachable subset in ascending source order', () => {
    const steps = collectSteps({
      kind: 'subset-sum',
      presetId: 'spec-reachable',
      presetLabel: 'Spec Reachable',
      presetDescription: 'Reachable target with one clean subset path.',
      numbers: [3, 5, 7],
      target: 10,
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.subsetSum.labels.resultTarget',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('T');
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.subsetSum.labels.subsetPath',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.values).toBe('3 + 7');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.subsetSum.phases.backtrackTake',
      ),
    ).toBe(true);
  });

  it('stops with an explicit no-subset state when target cannot be reached', () => {
    const steps = collectSteps({
      kind: 'subset-sum',
      presetId: 'spec-unreachable',
      presetLabel: 'Spec Unreachable',
      presetDescription: 'Target cannot be formed from the available numbers.',
      numbers: [4, 6],
      target: 5,
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('F');
    expect(keyOf(steps.at(-1)?.description)).toBe(
      'features.algorithms.runtime.dp.subsetSum.descriptions.impossible',
    );
    expect(
      steps.some((step) => step.phase === 'relax' || step.phase === 'skip-relax'),
    ).toBe(false);
  });
});
