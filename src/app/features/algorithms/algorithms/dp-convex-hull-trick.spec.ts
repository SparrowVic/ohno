import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { dpConvexHullTrickGenerator } from './dp-convex-hull-trick';
import type { SortStep } from '../models/sort-step';
import type { ChtDpScenario } from '../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: ChtDpScenario): SortStep[] {
  return [...dpConvexHullTrickGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('dp-convex-hull-trick', () => {
  it('recovers one optimal predecessor chain through the hull queries', () => {
    const steps = collectSteps({
      kind: 'dp-convex-hull-trick',
      presetId: 'spec-points',
      presetLabel: 'Spec Points',
      presetDescription: 'Three increasing points with a unique best predecessor chain.',
      xValues: [1, 2, 4],
      transitionCost: 1,
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.dpConvexHullTrick.labels.resultDp',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(7);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.dpConvexHullTrick.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.points).toBe('p1@1 → p2@2 → p3@4');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.dpConvexHullTrick.phases.backtrack',
      ),
    ).toBe(true);
  });
});
