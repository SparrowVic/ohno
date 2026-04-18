import { describe, expect, it } from 'vitest';

import { knapsack01Generator } from './knapsack-01';
import type { SortStep } from '../../models/sort-step';
import type { KnapsackScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: KnapsackScenario): SortStep[] {
  return [...knapsack01Generator(scenario)];
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('best = 22');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Pack: Rope, Stove');
    expect(
      steps.filter((step) => step.dp?.phaseLabel === 'Backtrack chosen item').length,
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

    expect(steps.at(-1)?.dp?.resultLabel).toBe('best = 0');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Pack: not traced yet');
    expect(
      steps.some((step) =>
        step.dp?.cells.some((cell) => cell.metaLabel === 'too heavy' && cell.status === 'blocked'),
      ),
    ).toBe(true);
  });
});
