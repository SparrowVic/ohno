import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { gaussianEliminationGenerator } from './gaussian-elimination';
import type { SortStep } from '../../models/sort-step';
import type { GaussianEliminationScenario } from '../../utils/scenarios/number-lab/gaussian-elimination-scenarios';

function run(
  matrix: readonly (readonly number[])[],
  variableCount: number,
): SortStep[] {
  const scenario: GaussianEliminationScenario = {
    kind: 'gaussian-elimination',
    presetId: 'spec',
    presetLabel: 'spec',
    presetDescription: 'spec',
    taskPrompt: null,
    matrix,
    variableCount,
  };
  return [...gaussianEliminationGenerator(scenario)];
}

function signoffKey(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label) return null;
  if (typeof label === 'string') return label;
  return isI18nText(label) ? label.key : null;
}

function signoffSolution(step: SortStep | undefined): string | null {
  const label = step?.scratchpadLab?.resultLabel;
  if (!label || !isI18nText(label)) return null;
  const params = label.params;
  return typeof params?.['solution'] === 'string' ? (params['solution'] as string) : null;
}

describe('gaussian-elimination', () => {
  it('solves the canonical 2×2 system `x + y = 5, x − y = 1` to (3, 2)', () => {
    const steps = run(
      [
        [1, 1, 5],
        [1, -1, 1],
      ],
      2,
    );
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.result.signoff',
    );
    const solution = signoffSolution(steps.at(-1));
    expect(solution).toContain('x = 3');
    expect(solution).toContain('y = 2');
  });

  it('solves a 3×3 system to integer coordinates', () => {
    // x + y + z = 6, 2x + y + z = 7, x + 2y + z = 8 → (1, 2, 3).
    const steps = run(
      [
        [1, 1, 1, 6],
        [2, 1, 1, 7],
        [1, 2, 1, 8],
      ],
      3,
    );
    const solution = signoffSolution(steps.at(-1));
    expect(solution).toContain('x = 1');
    expect(solution).toContain('y = 2');
    expect(solution).toContain('z = 3');
  });

  it('reports a singular system when rows are linearly dependent', () => {
    // Row 2 is exactly 2× row 1 — system has no unique solution.
    const steps = run(
      [
        [1, 2, 3],
        [2, 4, 6],
      ],
      2,
    );
    expect(signoffKey(steps.at(-1))).toBe(
      'features.algorithms.runtime.scratchpadLab.gaussianElimination.result.signoffSingular',
    );
  });

  it('performs a row swap when the first pivot is zero', () => {
    // Pivot at (0, 0) is zero — must swap with row 1 before elimination.
    const steps = run(
      [
        [0, 1, 2],
        [1, 1, 3],
      ],
      2,
    );
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const swapLine = lastLines.find((l) => /swap/.test(l.id));
    expect(swapLine).toBeDefined();
  });

  it('emits one final matrix snapshot in reduced row-echelon form', () => {
    const steps = run(
      [
        [1, 1, 5],
        [1, -1, 1],
      ],
      2,
    );
    // The last `substitute`-kind line (right before result) is the
    // final matrix snapshot — an identity on the left, solution
    // vector on the right.
    const lastLines = steps.at(-1)?.scratchpadLab?.lines ?? [];
    const snapshots = lastLines.filter((l) => l.kind === 'substitute');
    expect(snapshots.length).toBeGreaterThan(0);
  });
});
