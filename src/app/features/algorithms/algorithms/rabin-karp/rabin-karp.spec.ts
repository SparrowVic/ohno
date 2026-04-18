import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import type { RabinKarpScenario } from '../../utils/string-scenarios/string-scenarios';
import { rabinKarpGenerator } from './rabin-karp';

function collectSteps(scenario: RabinKarpScenario): SortStep[] {
  return [...rabinKarpGenerator(scenario)];
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

    expect(steps.some((step) => step.string?.phaseLabel === 'False alarm')).toBe(true);
    expect(steps.some((step) => step.string?.phaseLabel === 'Verified match')).toBe(true);
    expect(steps.at(-1)?.string?.resultLabel).toBe('4');
    expect(steps.at(-1)?.description).toContain('Verified matches at indices 4');
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

    expect(steps.at(-1)?.string?.resultLabel).toBe('No match');
    expect(steps.some((step) => step.string?.phaseLabel === 'Verified match')).toBe(false);
  });
});
