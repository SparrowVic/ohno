import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { regexMatchingDpGenerator } from './regex-matching-dp';
import type { SortStep } from '../../models/sort-step';
import { createRegexMatchingScenario, REGEX_PRESETS } from '../../utils/scenarios/dp/dp-scenarios';
import type { RegexMatchingScenario } from '../../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: RegexMatchingScenario): SortStep[] {
  return [...regexMatchingDpGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('regex-matching-dp', () => {
  it('ends the default preset at the default size in a match', () => {
    const scenario = createRegexMatchingScenario(6, REGEX_PRESETS[0]!.id);
    const last = collectSteps(scenario).at(-1);
    expect(scenario.source).toBe('AABBBC');
    expect(keyOf(last?.dp?.resultLabel)).toBe('features.algorithms.runtime.dp.regexMatching.labels.resultMatch');
    expect(paramsOf(last?.dp?.resultLabel)?.value).toBe('T');
  });


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
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.regexMatching.labels.resultMatch',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('T');
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.regexMatching.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.route).toBe('a*→∅ · a*→a · a*→a');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.regexMatching.phases.traceStarConsume',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.regexMatching.phases.traceStarEmpty',
      ),
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

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('F');
    expect(keyOf(steps.at(-1)?.description)).toBe(
      'features.algorithms.runtime.dp.regexMatching.descriptions.noMatch',
    );
    expect(
      steps.some((step) =>
        keyOf(step.dp?.phaseLabel)?.startsWith(
          'features.algorithms.runtime.dp.regexMatching.phases.trace',
        ) ?? false,
      ),
    ).toBe(false);
  });
});
