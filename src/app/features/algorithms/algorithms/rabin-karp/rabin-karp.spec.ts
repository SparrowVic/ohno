import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { RabinKarpScenario } from '../../utils/string-scenarios/string-scenarios';
import { rabinKarpGenerator } from './rabin-karp';

function collectSteps(scenario: RabinKarpScenario): SortStep[] {
  return [...rabinKarpGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('rabin-karp', () => {
  it('distinguishes a hash collision from a later verified match', () => {
    const steps = collectSteps({
      kind: 'rabin-karp',
      presetId: 'spec-collision',
      presetLabel: 'Spec Collision',
      presetDescription: 'First window collides, later window really matches.',
      text: 'ABAACABA',
      pattern: 'CABA',
      base: 31,
      mod: 11,
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.rabinKarp.phases.falseAlarm',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.rabinKarp.phases.verifiedMatch',
      ),
    ).toBe(true);
    expect(steps.at(-1)?.string?.resultLabel).toBe('4');
    expect(keyOf(steps.at(-1)?.description)).toBe(
      'features.algorithms.runtime.string.rabinKarp.descriptions.completeMatches',
    );
  });

  it('reports no match when every candidate window is rejected', () => {
    const steps = collectSteps({
      kind: 'rabin-karp',
      presetId: 'spec-no-hit',
      presetLabel: 'Spec No Hit',
      presetDescription: 'Rolling hashes never confirm the pattern.',
      text: 'ABCDEFG',
      pattern: 'XYZ',
      base: 31,
      mod: 23,
    });

    expect(keyOf(steps.at(-1)?.string?.resultLabel)).toBe(
      'features.algorithms.runtime.string.rabinKarp.labels.noMatch',
    );
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.rabinKarp.phases.verifiedMatch',
      ),
    ).toBe(false);
  });
});
