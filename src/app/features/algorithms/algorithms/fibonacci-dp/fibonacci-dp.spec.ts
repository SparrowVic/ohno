import { describe, expect, it } from 'vitest';

import { fibonacciDpGenerator } from './fibonacci-dp';
import type { SortStep } from '../../models/sort-step';
import type { FibonacciScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: FibonacciScenario): SortStep[] {
  return [...fibonacciDpGenerator(scenario)];
}

describe('fibonacci-dp', () => {
  it('tabulates Fibonacci values left-to-right and finishes with the right result', () => {
    const steps = collectSteps({
      kind: 'fibonacci-dp',
      presetId: 'spec-classic',
      presetLabel: 'Spec Classic',
      presetDescription: 'Deterministic Fibonacci scenario for testing.',
      n: 6,
    });

    expect(steps).toHaveLength(12);
    expect(steps[0]?.phase).toBe('init');
    expect(steps[1]?.phase).toBe('compare');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.dp?.resultLabel).toBe('F(6) = 8');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Sequence: 0 · 1 · 1 · 2 · 3 · 5 · 8');
    expect(steps.at(-1)?.dp?.activeLabel).toBe('term 6');
    expect(steps[1]?.dp?.computation?.expression).toBe('1 + 0');
  });

  it('handles the base-only case without entering the recurrence loop', () => {
    const steps = collectSteps({
      kind: 'fibonacci-dp',
      presetId: 'spec-base',
      presetLabel: 'Spec Base',
      presetDescription: 'Smallest non-zero Fibonacci case.',
      n: 1,
    });

    expect(steps.map((step) => step.phase)).toEqual(['init', 'complete']);
    expect(steps.at(-1)?.dp?.resultLabel).toBe('F(1) = 1');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Sequence: 0 · 1');
  });
});
