import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { coinChangeGenerator } from './coin-change';
import type { SortStep } from '../../models/sort-step';
import type { CoinChangeScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: CoinChangeScenario): SortStep[] {
  return [...coinChangeGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
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
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.coinChange.labels.resultMinCoins',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('2');
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.coinChange.labels.coinPath',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.coins).toBe('3 + 3');
    expect(
      steps.filter(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.coinChange.phases.backtrackTake',
      ).length,
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
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('∞');
    expect(keyOf(steps.at(-1)?.description)).toBe(
      'features.algorithms.runtime.dp.coinChange.descriptions.unreachable',
    );
    expect(
      steps.some((step) => step.phase === 'relax' || step.phase === 'skip-relax'),
    ).toBe(false);
  });
});
