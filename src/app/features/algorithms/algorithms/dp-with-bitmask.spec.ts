import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { dpWithBitmaskGenerator } from './dp-with-bitmask';
import type { SortStep } from '../models/sort-step';
import type { BitmaskDpScenario } from '../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: BitmaskDpScenario): SortStep[] {
  return [...dpWithBitmaskGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('dp-with-bitmask', () => {
  it('recovers the cheapest worker-to-job assignment from the subset DP table', () => {
    const steps = collectSteps({
      kind: 'dp-with-bitmask',
      presetId: 'spec-crews',
      presetLabel: 'Spec Crews',
      presetDescription: 'Two workers with one clearly optimal cross-assignment.',
      workers: ['Ana', 'Ben'],
      jobs: ['QA', 'Ops'],
      costs: [
        [9, 1],
        [2, 8],
      ],
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.bitmaskDp.labels.resultCost',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(3);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.bitmaskDp.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.assignments).toBe('Ana→Ops · Ben→QA');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.bitmaskDp.phases.recoverAssignment',
      ),
    ).toBe(true);
  });
});
