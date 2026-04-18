import { describe, expect, it } from 'vitest';

import { matrixChainMultiplicationGenerator } from './matrix-chain-multiplication';
import type { SortStep } from '../../models/sort-step';
import type { MatrixChainScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: MatrixChainScenario): SortStep[] {
  return [...matrixChainMultiplicationGenerator(scenario)];
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('cost = 4500');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('((A1 · A2) · A3)');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Trace optimal split'),
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

    expect(steps.at(-1)?.dp?.resultLabel).toBe('cost = 0');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('A1');
    expect(
      steps.filter((step) => step.dp?.phaseLabel === 'Trace leaf interval').length,
    ).toBe(1);
  });
});
