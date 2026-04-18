import { describe, expect, it } from 'vitest';

import { climbingStairsGenerator } from './climbing-stairs';
import type { SortStep } from '../../models/sort-step';
import type { ClimbingStairsScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: ClimbingStairsScenario): SortStep[] {
  return [...climbingStairsGenerator(scenario)];
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('ways = 8');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Sequence: 1 · 1 · 2 · 3 · 5 · 8');
    expect(steps[1]?.dp?.computation?.decision).toBe('add one-step and two-step arrivals');
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('ways = 1');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Sequence: 1 · 1');
  });
});
