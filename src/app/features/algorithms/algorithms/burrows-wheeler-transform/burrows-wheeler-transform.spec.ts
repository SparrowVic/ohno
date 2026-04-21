import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { BurrowsWheelerScenario } from '../../utils/string-scenarios/string-scenarios';
import { burrowsWheelerTransformGenerator } from './burrows-wheeler-transform';

function collectSteps(scenario: BurrowsWheelerScenario): SortStep[] {
  return [...burrowsWheelerTransformGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('burrows-wheeler-transform', () => {
  it('produces the canonical BANANA$ transform and denser runs', () => {
    const steps = collectSteps({
      kind: 'burrows-wheeler-transform',
      presetId: 'spec-banana',
      presetLabel: 'Spec Banana',
      presetDescription: 'Canonical BWT example.',
      source: 'BANANA$',
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.string?.resultLabel).toBe('ANNB$AA');
    expect(finalStep?.string?.firstColumn).toBe('$AAABNN');
    expect(finalStep?.string?.runGroups).toHaveLength(5);
    expect(finalStep?.string?.compressionRatio).toBeCloseTo(1.4);
    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.burrowsWheelerTransform.phases.sortRows',
      ),
    ).toBe(true);
  });

  it('keeps the run count flat when the input has no repeated clustering benefit', () => {
    const steps = collectSteps({
      kind: 'burrows-wheeler-transform',
      presetId: 'spec-flat',
      presetLabel: 'Spec Flat',
      presetDescription: 'No repeated characters to cluster.',
      source: 'ABCD$',
    });
    const finalStep = steps.at(-1);

    expect(finalStep?.string?.resultLabel).toBe('D$ABC');
    expect(finalStep?.string?.compressionRatio).toBe(1);
    expect(finalStep?.string?.runGroups).toHaveLength(5);
  });
});
