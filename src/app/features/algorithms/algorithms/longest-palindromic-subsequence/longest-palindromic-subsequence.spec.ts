import { describe, expect, it } from 'vitest';

import { longestPalindromicSubsequenceGenerator } from './longest-palindromic-subsequence';
import type { SortStep } from '../../models/sort-step';
import type { LpsScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: LpsScenario): SortStep[] {
  return [...longestPalindromicSubsequenceGenerator(scenario)];
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
    expect(steps.at(-1)?.dp?.resultLabel).toBe('len = 5');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('LPS: abcba');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Trace palindrome center'),
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

    expect(steps.at(-1)?.dp?.resultLabel).toBe('len = 1');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('LPS: c');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Skip left boundary'),
    ).toBe(true);
  });
});
