import { describe, expect, it } from 'vitest';

import { wildcardMatchingGenerator } from './wildcard-matching';
import type { SortStep } from '../../models/sort-step';
import type { WildcardMatchingScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: WildcardMatchingScenario): SortStep[] {
  return [...wildcardMatchingGenerator(scenario)];
}

describe('wildcard-matching', () => {
  it('traces one valid wildcard route with both consuming and empty star branches', () => {
    const steps = collectSteps({
      kind: 'wildcard-matching',
      presetId: 'spec-star',
      presetLabel: 'Spec Star',
      presetDescription: 'Star should consume one character and then collapse to empty.',
      source: 'ab',
      target: '*b',
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.dp?.resultLabel).toBe('match = T');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Route: *→∅ · *→a · b=b');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Trace star consume'),
    ).toBe(true);
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Trace star empty branch'),
    ).toBe(true);
  });

  it('reports no full match when the pattern cannot cover the text', () => {
    const steps = collectSteps({
      kind: 'wildcard-matching',
      presetId: 'spec-fail',
      presetLabel: 'Spec Fail',
      presetDescription: 'Literal mismatch after wildcard prefix.',
      source: 'ab',
      target: '*c',
    });

    expect(steps.at(-1)?.dp?.resultLabel).toBe('match = F');
    expect(steps.at(-1)?.description).toContain('do not match');
    expect(
      steps.some((step) => step.dp?.phaseLabel?.startsWith('Trace ')),
    ).toBe(false);
  });
});
