import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { simplexAlgorithmGenerator } from './simplex-algorithm';
import type { SortStep } from '../../models/sort-step';
import type { SimplexAlgorithmScenario } from '../../utils/scenarios/number-lab/simplex-algorithm-scenarios';

function run(
  objective: readonly number[],
  constraints: readonly (readonly number[])[],
  rhs: readonly number[],
): SortStep[] {
  const scenario: SimplexAlgorithmScenario = {
    kind: 'simplex-algorithm',
    presetId: 'spec',
    presetLabel: 'spec',
    presetDescription: 'spec',
    taskPrompt: null,
    objective,
    constraintMatrix: constraints,
    rhs,
  };
  return [...simplexAlgorithmGenerator(scenario)];
}

function signoffKey(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label) return null;
  if (typeof label === 'string') return label;
  return isI18nText(label) ? label.key : null;
}

function signoffParams(step: SortStep | undefined): Record<string, unknown> | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label || !isI18nText(label)) return null;
  return { ...(label.params ?? {}) };
}

describe('simplex-algorithm', () => {
  it('solves the canonical max 40x + 30y s.t. x+y ≤ 12, 2x+y ≤ 16 to (4, 8, z=400)', () => {
    const steps = run(
      [40, 30],
      [
        [1, 1],
        [2, 1],
      ],
      [12, 16],
    );
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.simplex.result.signoff',
    );
    const params = signoffParams(steps.at(-1));
    expect(params?.['objective']).toBe('400');
    expect(params?.['solution']).toContain('x = 4');
    expect(params?.['solution']).toContain('y = 8');
  });

  it('picks the y-column first when y has the larger reduced cost', () => {
    // max y s.t. x+y ≤ 5, x ≤ 3 → optimum (0, 5, z = 5).
    const steps = run(
      [0, 1],
      [
        [1, 1],
        [1, 0],
      ],
      [5, 3],
    );
    const params = signoffParams(steps.at(-1));
    expect(params?.['objective']).toBe('5');
    expect(params?.['solution']).toContain('y = 5');
  });

  it('reports unbounded when no positive pivot exists', () => {
    // max x s.t. -x + y ≤ 1, x - y ≤ 1, x,y ≥ 0 — the feasible
    // region extends to infinity along x=y, so x can grow without
    // bound.
    const steps = run(
      [1, 0],
      [
        [-1, 1],
        [1, -1],
      ],
      [1, 1],
    );
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.simplex.result.signoffFailure',
    );
  });

  it('emits one tableau snapshot per pivot plus the initial tableau', () => {
    const steps = run(
      [40, 30],
      [
        [1, 1],
        [2, 1],
      ],
      [12, 16],
    );
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const snapshots = lastLines.filter(
      (l) => l.id === 'initial' || /^iter-\d+-pivot$/.test(l.id),
    );
    // Initial + 2 pivots = 3 snapshots for this LP.
    expect(snapshots.length).toBe(3);
  });
});
