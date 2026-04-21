import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { burstBalloonsGenerator } from './burst-balloons';
import type { SortStep } from '../../models/sort-step';
import type { BurstBalloonsScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: BurstBalloonsScenario): SortStep[] {
  return [...burstBalloonsGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
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
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.burstBalloons.labels.resultCoins',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(10);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.burstBalloons.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.order).toBe('#1 → #2');
    expect(
      steps.filter(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.burstBalloons.phases.appendBurst',
      ).length,
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

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(7);
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.order).toBe('#1');
    expect(
      steps.filter(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.burstBalloons.phases.traceSplit',
      ).length,
    ).toBe(1);
  });
});
