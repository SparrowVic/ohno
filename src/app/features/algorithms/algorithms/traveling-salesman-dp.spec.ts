import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { travelingSalesmanDpGenerator } from './traveling-salesman-dp';
import type { SortStep } from '../models/sort-step';
import type { TravelingSalesmanScenario } from '../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: TravelingSalesmanScenario): SortStep[] {
  return [...travelingSalesmanDpGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('traveling-salesman-dp', () => {
  it('recovers one cheapest Hamiltonian tour from the subset table', () => {
    const steps = collectSteps({
      kind: 'traveling-salesman-dp',
      presetId: 'spec-loop',
      presetLabel: 'Spec Loop',
      presetDescription: 'Three-city loop with a unique best cycle.',
      labels: ['A', 'B', 'C'],
      distances: [
        [0, 1, 5],
        [3, 0, 2],
        [3, 2, 0],
      ],
      startIndex: 0,
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.travelingSalesman.labels.resultTour',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(6);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.travelingSalesman.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.tour).toBe('A → B → C → A');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.travelingSalesman.phases.backtrackRoute',
      ),
    ).toBe(true);
  });
});
