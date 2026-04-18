import { describe, expect, it } from 'vitest';

import { subsetSumGenerator } from './subset-sum';
import type { SortStep } from '../../models/sort-step';
import type { SubsetSumScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: SubsetSumScenario): SortStep[] {
  return [...subsetSumGenerator(scenario)];
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('target = T');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Subset: 3 + 7');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Backtrack take'),
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('target = F');
    expect(steps.at(-1)?.description).toContain('impossible');
    expect(
      steps.some((step) => step.phase === 'relax' || step.phase === 'skip-relax'),
    ).toBe(false);
  });
});
