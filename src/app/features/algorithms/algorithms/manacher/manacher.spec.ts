import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { ManacherScenario } from '../../utils/string-scenarios/string-scenarios';
import { manacherGenerator } from './manacher';

function collectSteps(scenario: ManacherScenario): SortStep[] {
  return [...manacherGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('manacher', () => {
  it('reuses mirrored radii and reports the longest palindrome', () => {
    const steps = collectSteps({
      kind: 'manacher',
      presetId: 'spec-symmetry',
      presetLabel: 'Spec Symmetry',
      presetDescription: 'Whole string forms one centered palindrome.',
      source: 'ABACABA',
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.manacher.phases.mirrorReuse',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.manacher.phases.shiftWindow',
      ),
    ).toBe(true);
    expect(steps.at(-1)?.string?.resultLabel).toBe('ABACABA');
    expect(steps.at(-1)?.string?.longestRadius).toBeGreaterThan(1);
  });

  it('falls back to the first single-character palindrome when no longer span exists', () => {
    const steps = collectSteps({
      kind: 'manacher',
      presetId: 'spec-single',
      presetLabel: 'Spec Single',
      presetDescription: 'No palindrome longer than one character exists.',
      source: 'ABCDE',
    });

    expect(steps.at(-1)?.string?.resultLabel).toBe('A');
    expect(steps.at(-1)?.string?.longestRadius).toBe(1);
  });
});
