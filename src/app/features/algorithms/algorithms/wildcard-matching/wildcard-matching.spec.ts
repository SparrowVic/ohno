import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../../core/i18n/translatable-text';
import { wildcardMatchingGenerator } from './wildcard-matching';
import type { SortStep } from '../../models/sort-step';
import type { WildcardMatchingScenario } from '../../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: WildcardMatchingScenario): SortStep[] {
  return [...wildcardMatchingGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
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
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.wildcardMatching.labels.resultMatch',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('T');
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.wildcardMatching.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.route).toBe('*→∅ · *→a · b=b');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.wildcardMatching.phases.traceStarConsume',
      ),
    ).toBe(true);
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.wildcardMatching.phases.traceStarEmpty',
      ),
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

    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe('F');
    expect(keyOf(steps.at(-1)?.description)).toBe(
      'features.algorithms.runtime.dp.wildcardMatching.descriptions.noMatch',
    );
    expect(
      steps.some((step) =>
        keyOf(step.dp?.phaseLabel)?.startsWith(
          'features.algorithms.runtime.dp.wildcardMatching.phases.trace',
        ) ?? false,
      ),
    ).toBe(false);
  });
});
