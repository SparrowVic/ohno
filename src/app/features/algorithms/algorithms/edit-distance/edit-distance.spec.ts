import { describe, expect, it } from 'vitest';

import { editDistanceGenerator } from './edit-distance';
import type { SortStep } from '../../models/sort-step';
import type { EditDistanceScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: EditDistanceScenario): SortStep[] {
  return [...editDistanceGenerator(scenario)];
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('dist = 1');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('keep c • replace a→u • keep t');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Backtrack replace'),
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

    expect(steps.at(-1)?.dp?.resultLabel).toBe('dist = 1');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('keep c • insert h • keep a • keep t');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Backtrack insert'),
    ).toBe(true);
  });
});
