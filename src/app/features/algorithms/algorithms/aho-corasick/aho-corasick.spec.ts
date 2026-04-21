import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import type { SortStep } from '../../models/sort-step';
import type { AhoCorasickScenario } from '../../utils/string-scenarios/string-scenarios';
import { ahoCorasickGenerator } from './aho-corasick';

function collectSteps(scenario: AhoCorasickScenario): SortStep[] {
  return [...ahoCorasickGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

describe('aho-corasick', () => {
  it('builds failure links and reports overlapping multi-pattern matches', () => {
    const steps = collectSteps({
      kind: 'aho-corasick',
      presetId: 'spec-classic',
      presetLabel: 'Spec Classic',
      presetDescription: 'Classic ushers example.',
      text: 'ushers',
      patterns: ['he', 'she', 'his', 'hers'],
    });

    expect(
      steps.some(
        (step) =>
          keyOf(step.string?.phaseLabel) ===
          'features.algorithms.runtime.string.ahoCorasick.phases.buildFailure',
      ),
    ).toBe(true);

    expect(steps.at(-1)?.string?.matches).toEqual([
      { pattern: 'she', startIndex: 1, endIndex: 3 },
      { pattern: 'he', startIndex: 2, endIndex: 3 },
      { pattern: 'hers', startIndex: 2, endIndex: 5 },
    ]);
  });

  it('reuses shared prefixes while inserting the trie', () => {
    const steps = collectSteps({
      kind: 'aho-corasick',
      presetId: 'spec-prefix',
      presetLabel: 'Spec Prefix',
      presetDescription: 'Patterns share the same initial branch.',
      text: 'aaaa',
      patterns: ['a', 'aa', 'aaa'],
    });

    const finalState = steps.at(-1)?.string;
    expect(finalState?.nodes.length).toBe(4);
    expect(finalState?.matches.length).toBeGreaterThan(0);
  });
});
