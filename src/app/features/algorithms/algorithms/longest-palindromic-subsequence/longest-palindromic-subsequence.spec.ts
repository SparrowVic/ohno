import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { longestPalindromicSubsequenceGenerator } from './longest-palindromic-subsequence';
import type { SortStep } from '../../models/sort-step';
import type { LpsScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: LpsScenario): SortStep[] {
  return [...longestPalindromicSubsequenceGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('longest-palindromic-subsequence', () => {
  it('reconstructs the full palindrome when the whole string is mirrored', () => {
    const steps = collectSteps({
      kind: 'longest-palindromic-subsequence',
      presetId: 'spec-full',
      presetLabel: 'Spec Full',
      presetDescription: 'Whole source string is already a palindrome.',
      source: 'abcba',
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.resultLength',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(5);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.longestPalindromicSubsequence.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.value).toBe('abcba');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.traceCenter',
      ),
    ).toBe(true);
  });

  it('falls back to skip branches when no mirrored pair survives', () => {
    const steps = collectSteps({
      kind: 'longest-palindromic-subsequence',
      presetId: 'spec-skip',
      presetLabel: 'Spec Skip',
      presetDescription: 'No long palindrome should force boundary skipping.',
      source: 'abc',
    });

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(1);
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.value).toBe('c');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.longestPalindromicSubsequence.phases.skipLeft',
      ),
    ).toBe(true);
  });
});
