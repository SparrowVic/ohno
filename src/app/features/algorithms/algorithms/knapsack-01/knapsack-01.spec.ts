import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { knapsack01Generator } from './knapsack-01';
import type { SortStep } from '../../models/sort-step';
import type { KnapsackScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: KnapsackScenario): SortStep[] {
  return [...knapsack01Generator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('knapsack-01', () => {
  it('backtracks the unique best pack when multiple rows were compared', () => {
    const steps = collectSteps({
      kind: 'knapsack-01',
      presetId: 'spec-pack',
      presetLabel: 'Spec Pack',
      presetDescription: 'Capacity and items tuned for a unique optimal pair.',
      capacity: 5,
      items: [
        { id: 'map', label: 'Map', weight: 2, value: 6 },
        { id: 'rope', label: 'Rope', weight: 2, value: 10 },
        { id: 'stove', label: 'Stove', weight: 3, value: 12 },
      ],
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.knapsack01.labels.resultBest',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(22);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.knapsack01.labels.packPath',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.items).toBe('Rope, Stove');
    expect(
      steps.filter(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.knapsack01.phases.backtrackChosenItem',
      ).length,
    ).toBe(2);
  });

  it('keeps the pack empty when every item is too heavy', () => {
    const steps = collectSteps({
      kind: 'knapsack-01',
      presetId: 'spec-empty',
      presetLabel: 'Spec Empty',
      presetDescription: 'No item can fit inside the backpack.',
      capacity: 1,
      items: [
        { id: 'anvil', label: 'Anvil', weight: 2, value: 9 },
      ],
    });

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(0);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.knapsack01.labels.packPending',
    );
    expect(
      steps.some((step) =>
        step.dp?.cells.some((cell) => cell.metaLabel === 'too heavy' && cell.status === 'blocked'),
      ),
    ).toBe(true);
  });
});
