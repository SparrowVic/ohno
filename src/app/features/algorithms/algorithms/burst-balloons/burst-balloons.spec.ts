import { describe, expect, it } from 'vitest';

import { burstBalloonsGenerator } from './burst-balloons';
import type { SortStep } from '../../models/sort-step';
import type { BurstBalloonsScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: BurstBalloonsScenario): SortStep[] {
  return [...burstBalloonsGenerator(scenario)];
}

describe('burst-balloons', () => {
  it('recovers the best burst order for a two-balloon interval', () => {
    const steps = collectSteps({
      kind: 'burst-balloons',
      presetId: 'spec-pair',
      presetLabel: 'Spec Pair',
      presetDescription: 'Two balloons with a unique optimal final burst.',
      balloons: [1, 5],
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.dp?.resultLabel).toBe('coins = 10');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Order: #1 → #2');
    expect(
      steps.filter((step) => step.dp?.phaseLabel === 'Append burst to route').length,
    ).toBe(2);
  });

  it('handles the single-balloon base case without interval branching', () => {
    const steps = collectSteps({
      kind: 'burst-balloons',
      presetId: 'spec-single',
      presetLabel: 'Spec Single',
      presetDescription: 'Single balloon should trace a one-step order.',
      balloons: [7],
    });

    expect(steps.at(-1)?.dp?.resultLabel).toBe('coins = 7');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Order: #1');
    expect(
      steps.filter((step) => step.dp?.phaseLabel === 'Trace saved split').length,
    ).toBe(1);
  });
});
