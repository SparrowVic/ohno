import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { SuffixArrayScenario } from '../../utils/scenarios/string/string-scenarios';
import { suffixArrayConstructionGenerator } from './suffix-array-construction';

function collectSteps(scenario: SuffixArrayScenario): SortStep[] {
  return [...suffixArrayConstructionGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('suffix-array-construction', () => {
  it('builds the classic suffix order for banana', () => {
    const steps = collectSteps({
      kind: 'suffix-array-construction',
      presetId: 'spec-banana',
      presetLabel: 'Spec Banana',
      presetDescription: 'Classic banana suffix ordering.',
      source: 'banana',
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.suffixArray.phases.assignRanks',
      ),
    ).toBe(true);

    expect(steps.at(-1)?.string?.suffixArray).toEqual([5, 3, 1, 0, 4, 2]);
  });

  it('tracks distinct equivalence classes while ranks stabilize', () => {
    const steps = collectSteps({
      kind: 'suffix-array-construction',
      presetId: 'spec-abracadabra',
      presetLabel: 'Spec Abracadabra',
      presetDescription: 'Repeated prefixes should collapse into classes first.',
      source: 'abracadabra',
    });

    const finalState = steps.at(-1)?.string;
    expect(finalState?.distinctRanks).toBe('abracadabra'.length);
    expect(finalState?.rows.length).toBe('abracadabra'.length);
  });
});
