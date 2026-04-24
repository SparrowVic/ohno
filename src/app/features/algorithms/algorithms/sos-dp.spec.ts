import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { sosDpGenerator } from './sos-dp';
import type { SortStep } from '../models/sort-step';
import type { SosDpScenario } from '../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: SosDpScenario): SortStep[] {
  return [...sosDpGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('sos-dp', () => {
  it('sums all contributing submasks for the focused mask and traces them back', () => {
    const steps = collectSteps({
      kind: 'sos-dp',
      presetId: 'spec-bits',
      presetLabel: 'Spec Bits',
      presetDescription: 'Two-bit SOS table with all submasks contributing to 11.',
      bitCount: 2,
      baseValues: [1, 2, 3, 4],
      focusMask: 3,
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.sosDp.labels.resultSum',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(10);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.sosDp.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.masks).toBe('00 · 01 · 10 · 11');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.sosDp.phases.traceBase',
      ),
    ).toBe(true);
  });
});
