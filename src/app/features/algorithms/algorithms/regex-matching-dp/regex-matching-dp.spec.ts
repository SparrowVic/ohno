import { describe, expect, it } from 'vitest';

import { regexMatchingDpGenerator } from './regex-matching-dp';
import type { SortStep } from '../../models/sort-step';
import type { RegexMatchingScenario } from '../../utils/dp-scenarios/dp-scenarios';

function collectSteps(scenario: RegexMatchingScenario): SortStep[] {
  return [...regexMatchingDpGenerator(scenario)];
}

describe('regex-matching-dp', () => {
  it('traces a star group across repeated characters and zero occurrences', () => {
    const steps = collectSteps({
      kind: 'regex-matching-dp',
      presetId: 'spec-star-group',
      presetLabel: 'Spec Star Group',
      presetDescription: 'Regex star should consume repeated tokens and end with zero occurrences.',
      source: 'aa',
      target: 'a*',
    });

    expect(steps.at(-1)?.phase).toBe('complete');
    expect(steps.at(-1)?.dp?.resultLabel).toBe('match = T');
    expect(steps.at(-1)?.dp?.pathLabel).toBe('Route: a*→∅ · a*→a · a*→a');
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Trace star consume'),
    ).toBe(true);
    expect(
      steps.some((step) => step.dp?.phaseLabel === 'Trace empty star group'),
    ).toBe(true);
  });

  it('returns a failed complete state when the regex does not match', () => {
    const steps = collectSteps({
      kind: 'regex-matching-dp',
      presetId: 'spec-no-match',
      presetLabel: 'Spec No Match',
      presetDescription: 'Regex star group cannot force the wrong suffix.',
      source: 'ab',
      target: 'a*c',
    });

    expect(steps.at(-1)?.dp?.resultLabel).toBe('match = F');
    expect(steps.at(-1)?.description).toContain('does not satisfy');
    expect(
      steps.some((step) => step.dp?.phaseLabel?.startsWith('Trace ')),
    ).toBe(false);
  });
});
