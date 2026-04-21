import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { matrixChainMultiplicationGenerator } from './matrix-chain-multiplication';
import type { SortStep } from '../../models/sort-step';
import type { MatrixChainScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: MatrixChainScenario): SortStep[] {
  return [...matrixChainMultiplicationGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('matrix-chain-multiplication', () => {
  it('finds the cheapest parenthesization for a three-matrix chain', () => {
    const steps = collectSteps({
      kind: 'matrix-chain-multiplication',
      presetId: 'spec-classic',
      presetLabel: 'Spec Classic',
      presetDescription: 'Three matrices with a strongly preferred split.',
      dimensions: [10, 30, 5, 60],
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.matrixChain.labels.resultCost',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(4500);
    expect(steps.at(-1)?.dp?.pathLabel).toBe('((A1 · A2) · A3)');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.matrixChain.phases.traceSplit',
      ),
    ).toBe(true);
  });

  it('keeps the single-matrix case on the zero-cost diagonal', () => {
    const steps = collectSteps({
      kind: 'matrix-chain-multiplication',
      presetId: 'spec-single',
      presetLabel: 'Spec Single',
      presetDescription: 'One matrix should never need multiplication.',
      dimensions: [5, 10],
    });

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(0);
    expect(steps.at(-1)?.dp?.pathLabel).toBe('A1');
    expect(
      steps.filter(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.matrixChain.phases.traceLeaf',
      ).length,
    ).toBe(1);
  });
});
