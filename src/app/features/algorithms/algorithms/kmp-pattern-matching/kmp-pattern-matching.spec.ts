import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import type { KmpScenario } from '../../utils/string-scenarios/string-scenarios';
import { kmpPatternMatchingGenerator } from './kmp-pattern-matching';

function collectSteps(scenario: KmpScenario): SortStep[] {
  return [...kmpPatternMatchingGenerator(scenario)];
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

    expect(steps.some((step) => step.string?.phaseLabel === 'Failure fallback')).toBe(true);
    expect(steps.some((step) => step.string?.phaseLabel === 'Failure jump')).toBe(true);
    expect(steps.some((step) => step.string?.phaseLabel === 'Match reported')).toBe(true);
    expect(steps.at(-1)?.string?.resultLabel).toBe('10');
    expect(steps.at(-1)?.description).toContain('Matches found at indices 10');
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

    expect(steps.at(-1)?.string?.activeLabel).toBe('No hit');
    expect(steps.at(-1)?.string?.resultLabel).toBe('No match');
    expect(steps.some((step) => step.string?.phaseLabel === 'Match reported')).toBe(false);
  });
});
