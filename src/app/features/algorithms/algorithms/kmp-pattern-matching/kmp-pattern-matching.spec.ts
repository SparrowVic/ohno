import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { KmpScenario } from '../../utils/scenarios/string/string-scenarios';
import { kmpPatternMatchingGenerator } from './kmp-pattern-matching';

function collectSteps(scenario: KmpScenario): SortStep[] {
  return [...kmpPatternMatchingGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('kmp-pattern-matching', () => {
  it('builds failure links, jumps on mismatch, and reports the final hit', () => {
    const steps = collectSteps({
      kind: 'kmp-pattern-matching',
      presetId: 'spec-classic',
      presetLabel: 'Spec Classic',
      presetDescription: 'Classic KMP example with reusable prefixes.',
      text: 'ABABDABACDABABCABAB',
      pattern: 'ABABCABAB',
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.kmp.phases.failureFallback',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.kmp.phases.failureJump',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.kmp.phases.matchReported',
      ),
    ).toBe(true);
    expect(steps.at(-1)?.string?.resultLabel).toBe('10');
    expect(keyOf(steps.at(-1)?.description)).toBe(
      'features.algorithms.runtime.string.kmp.descriptions.completeMatches',
    );
  });

  it('finishes with no full hit when the text never satisfies the pattern', () => {
    const steps = collectSteps({
      kind: 'kmp-pattern-matching',
      presetId: 'spec-no-hit',
      presetLabel: 'Spec No Hit',
      presetDescription: 'Pattern never fully aligns with the source text.',
      text: 'AAAAA',
      pattern: 'BAA',
    });

    expect(keyOf(steps.at(-1)?.string?.activeLabel)).toBe(
      'features.algorithms.runtime.string.kmp.labels.noHit',
    );
    expect(keyOf(steps.at(-1)?.string?.resultLabel)).toBe(
      'features.algorithms.runtime.string.kmp.labels.noMatch',
    );
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.kmp.phases.matchReported',
      ),
    ).toBe(false);
  });
});
