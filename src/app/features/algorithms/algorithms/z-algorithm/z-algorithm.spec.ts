import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { ZAlgorithmScenario } from '../../utils/scenarios/string/string-scenarios';
import { zAlgorithmGenerator } from './z-algorithm';

function collectSteps(scenario: ZAlgorithmScenario): SortStep[] {
  return [...zAlgorithmGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('z-algorithm', () => {
  it('reuses the active Z-box and records every full-pattern bar', () => {
    const steps = collectSteps({
      kind: 'z-algorithm',
      presetId: 'spec-classic',
      presetLabel: 'Spec Classic',
      presetDescription: 'Three exact pattern hits with box reuse along the way.',
      pattern: 'ABA',
      text: 'ABACABAABA',
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.zAlgorithm.phases.reuseBox',
      ),
    ).toBe(true);
    expect(
      steps.filter(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.zAlgorithm.phases.patternHit',
      ),
    ).toHaveLength(3);
    expect(steps.at(-1)?.string?.resultLabel).toBe('0, 4, 7');
  });

  it('completes without a hit when no bar reaches full pattern height', () => {
    const steps = collectSteps({
      kind: 'z-algorithm',
      presetId: 'spec-no-hit',
      presetLabel: 'Spec No Hit',
      presetDescription: 'Prefix reuse exists but never reaches a full match.',
      pattern: 'XYZ',
      text: 'ABACABA',
    });

    expect(keyOf(steps.at(-1)?.string?.resultLabel)).toBe(
      'features.algorithms.runtime.string.zAlgorithm.labels.noMatch',
    );
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.zAlgorithm.phases.patternHit',
      ),
    ).toBe(false);
  });
});
