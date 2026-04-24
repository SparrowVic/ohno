import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { editDistanceGenerator } from './edit-distance';
import type { SortStep } from '../../models/sort-step';
import type { EditDistanceScenario } from '../../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: EditDistanceScenario): SortStep[] {
  return [...editDistanceGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('edit-distance', () => {
  it('produces a replace-based edit script when substitution is optimal', () => {
    const steps = collectSteps({
      kind: 'edit-distance',
      presetId: 'spec-replace',
      presetLabel: 'Spec Replace',
      presetDescription: 'Single substitution between short strings.',
      source: 'cat',
      target: 'cut',
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.editDistance.labels.resultDistance',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(1);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.editDistance.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.operations).toBe('c=c • a→u • t=t');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.editDistance.phases.backtrackReplace',
      ),
    ).toBe(true);
  });

  it('uses the insert branch when the target has one extra character', () => {
    const steps = collectSteps({
      kind: 'edit-distance',
      presetId: 'spec-insert',
      presetLabel: 'Spec Insert',
      presetDescription: 'One character insertion should be cheaper than replace/delete.',
      source: 'cat',
      target: 'chat',
    });

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(1);
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.operations).toBe('c=c • +h • a=a • t=t');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.editDistance.phases.backtrackInsert',
      ),
    ).toBe(true);
  });
});
