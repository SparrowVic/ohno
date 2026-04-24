import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { SuffixArrayLcpScenario } from '../../utils/scenarios/string/string-scenarios';
import { suffixArrayLcpKasaiGenerator } from './suffix-array-lcp-kasai';

function collectSteps(scenario: SuffixArrayLcpScenario): SortStep[] {
  return [...suffixArrayLcpKasaiGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('suffix-array-lcp-kasai', () => {
  it('computes the suffix array and LCP values for banana', () => {
    const steps = collectSteps({
      kind: 'suffix-array-lcp-kasai',
      presetId: 'spec-banana',
      presetLabel: 'Spec Banana',
      presetDescription: 'Classic banana suffix/LCP example.',
      source: 'banana',
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.suffixArrayLcp.phases.kasaiScan',
      ),
    ).toBe(true);

    expect(steps.at(-1)?.string?.suffixArray).toEqual([5, 3, 1, 0, 4, 2]);
    expect(steps.at(-1)?.string?.lcpValues).toEqual([1, 3, 0, 0, 2, 0]);
  });

  it('stores one row per suffix in the final trace state', () => {
    const steps = collectSteps({
      kind: 'suffix-array-lcp-kasai',
      presetId: 'spec-mississippi',
      presetLabel: 'Spec Mississippi',
      presetDescription: 'Dense repeated prefixes.',
      source: 'mississippi',
    });

    const finalState = steps.at(-1)?.string;
    expect(finalState?.rows.length).toBe('mississippi'.length);
    expect(finalState?.rankArray.length).toBe('mississippi'.length);
  });
});
