import { describe, expect, it } from 'vitest';

import type { SortStep } from '../../models/sort-step';
import type { ZAlgorithmScenario } from '../../utils/string-scenarios/string-scenarios';
import { zAlgorithmGenerator } from './z-algorithm';

function collectSteps(scenario: ZAlgorithmScenario): SortStep[] {
  return [...zAlgorithmGenerator(scenario)];
}

describe('z-algorithm', () => {
  it('reuses the active Z-box and records every full-pattern bar', () => {
    const steps = collectSteps({
      kind: 'z-algorithm',
      presetId: 'spec-classic',
      presetLabel: 'Spec Classic',
      presetDescription: 'Three exact pattern hits with box reuse along the way.',
      pattern: 'ABA',
      text: 'ABACABAABA',
    });

    expect(steps.some((step) => step.string?.phaseLabel === 'Reuse box')).toBe(true);
    expect(steps.filter((step) => step.string?.phaseLabel === 'Pattern hit')).toHaveLength(3);
    expect(steps.at(-1)?.string?.resultLabel).toBe('0, 4, 7');
  });

  it('completes without a hit when no bar reaches full pattern height', () => {
    const steps = collectSteps({
      kind: 'z-algorithm',
      presetId: 'spec-no-hit',
      presetLabel: 'Spec No Hit',
      presetDescription: 'Prefix reuse exists but never reaches a full match.',
      pattern: 'XYZ',
      text: 'ABACABA',
    });

    expect(steps.at(-1)?.string?.resultLabel).toBe('No match');
    expect(steps.some((step) => step.string?.phaseLabel === 'Pattern hit')).toBe(false);
  });
});
