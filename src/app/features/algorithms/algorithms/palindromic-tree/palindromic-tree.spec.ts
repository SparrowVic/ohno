import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { PalindromicTreeScenario } from '../../utils/string-scenarios/string-scenarios';
import { palindromicTreeGenerator } from './palindromic-tree';

function collectSteps(scenario: PalindromicTreeScenario): SortStep[] {
  return [...palindromicTreeGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('palindromic-tree', () => {
  it('creates one node per distinct palindrome in abacaba', () => {
    const steps = collectSteps({
      kind: 'palindromic-tree',
      presetId: 'spec-symmetry',
      presetLabel: 'Spec Symmetry',
      presetDescription: 'Centered palindrome chain.',
      source: 'abacaba',
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.palindromicTree.phases.insertNode',
      ),
    ).toBe(true);

    expect(steps.at(-1)?.string?.distinctCount).toBe(7);
  });

  it('follows suffix links while building a repeated-palindrome input', () => {
    const steps = collectSteps({
      kind: 'palindromic-tree',
      presetId: 'spec-banana',
      presetLabel: 'Spec Banana',
      presetDescription: 'Repeated palindromic suffixes.',
      source: 'banana',
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.palindromicTree.phases.followLink',
      ),
    ).toBe(true);
    expect(steps.at(-1)?.string?.distinctCount).toBe(6);
  });
});
