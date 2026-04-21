import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { profileDpGenerator } from './profile-dp';
import type { SortStep } from '../models/sort-step';
import type { ProfileDpScenario } from '../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: ProfileDpScenario): SortStep[] {
  return [...profileDpGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('profile-dp', () => {
  it('counts domino tilings and traces one valid frontier route', () => {
    const steps = collectSteps({
      kind: 'profile-dp',
      presetId: 'spec-board',
      presetLabel: 'Spec Board',
      presetDescription: 'Two-column 2x2 board with two valid tilings.',
      height: 2,
      columns: 2,
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.profileDp.labels.resultTilings',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(2);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.profileDp.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.route).toBe('00 → 00 → 00');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.profileDp.phases.backtrackRoute',
      ),
    ).toBe(true);
  });
});
