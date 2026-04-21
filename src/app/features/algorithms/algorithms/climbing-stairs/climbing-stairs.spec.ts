import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { climbingStairsGenerator } from './climbing-stairs';
import type { SortStep } from '../../models/sort-step';
import type { ClimbingStairsScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: ClimbingStairsScenario): SortStep[] {
  return [...climbingStairsGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('climbing-stairs', () => {
  it('builds the staircase counts with Fibonacci-like recurrence', () => {
    const steps = collectSteps({
      kind: 'climbing-stairs',
      presetId: 'spec-tower',
      presetLabel: 'Spec Tower',
      presetDescription: 'Five-step staircase for recurrence assertions.',
      steps: 5,
    });

    expect(steps).toHaveLength(10);
    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.climbingStairs.labels.resultValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(8);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.climbingStairs.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.sequence).toBe('1 · 1 · 2 · 3 · 5 · 8');
    expect(keyOf(steps[1]?.dp?.computation?.decision)).toBe(
      'features.algorithms.runtime.dp.climbingStairs.decisions.addArrivals',
    );
  });

  it('keeps the trace compact for a single stair', () => {
    const steps = collectSteps({
      kind: 'climbing-stairs',
      presetId: 'spec-one',
      presetLabel: 'Spec One',
      presetDescription: 'Single stair should skip recurrence work.',
      steps: 1,
    });

    expect(steps.map((step) => step.phase)).toEqual(['init', 'complete']);
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(1);
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.sequence).toBe('1 · 1');
  });
});
