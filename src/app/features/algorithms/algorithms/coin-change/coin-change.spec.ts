import { describe, expect, it } from 'vitest';

import { coinChangeGenerator } from './coin-change';
import type { SortStep } from '../../models/sort-step';
import type { CoinChangeScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: CoinChangeScenario): SortStep[] {
  return [...coinChangeGenerator(scenario)];
}

describe('coin-change', () => {
  it('finds the minimum reusable coin combination and traces it back', () => {
    const steps = collectSteps({
      kind: 'coin-change',
      presetId: 'spec-metro',
      presetLabel: 'Spec Metro',
      presetDescription: 'Reachable target with a unique best combination.',
      coins: [1, 3, 4],
      target: 6,
    });

    const phases = steps.map((step) => step.phase);

    expect(steps[0]?.phase).toBe('init');
    expect(phases).toContain('relax');
    expect(phases).toContain('skip-relax');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.dp?.resultLabel).toBe('min coins = 2');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Coins: 3 + 3');
    expect(
      steps.filter((step) => step.dp?.phaseLabel === 'Backtrack take').length,
    ).toBe(2);
  });

  it('terminates early with an explicit no-solution state when target is unreachable', () => {
    const steps = collectSteps({
      kind: 'coin-change',
      presetId: 'spec-blocked',
      presetLabel: 'Spec Blocked',
      presetDescription: 'No denomination set can reach the target.',
      coins: [4, 6],
      target: 5,
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.dp?.resultLabel).toBe('min coins = ∞');
    expect(steps.at(-1)?.description).toContain('unreachable');
    expect(
      steps.some((step) => step.phase === 'relax' || step.phase === 'skip-relax'),
    ).toBe(false);
  });
});
