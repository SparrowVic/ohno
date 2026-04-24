import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { fibonacciDpGenerator } from './fibonacci-dp';
import type { SortStep } from '../../models/sort-step';
import type { FibonacciScenario } from '../../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: FibonacciScenario): SortStep[] {
  return [...fibonacciDpGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
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
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.fibonacci.labels.resultValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)).toEqual({ index: 6, value: 8 });
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.fibonacci.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.sequence).toBe('0 · 1 · 1 · 2 · 3 · 5 · 8');
    expect(keyOf(steps.at(-1)?.dp?.activeLabel)).toBe(
      'features.algorithms.runtime.dp.fibonacci.labels.activeTerm',
    );
    expect(paramsOf(steps.at(-1)?.dp?.activeLabel)?.index).toBe(6);
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
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)).toEqual({ index: 1, value: 1 });
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.sequence).toBe('0 · 1');
  });
});
