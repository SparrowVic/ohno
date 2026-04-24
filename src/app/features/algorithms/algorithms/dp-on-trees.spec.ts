import { describe, expect, it } from 'vitest';

import { isI18nText } from '../../../core/i18n/translatable-text';
import { dpOnTreesGenerator } from './dp-on-trees';
import type { SortStep } from '../models/sort-step';
import type { TreeDpScenario } from '../utils/scenarios/dp/dp-scenarios';

function collectSteps(scenario: TreeDpScenario): SortStep[] {
  return [...dpOnTreesGenerator(scenario)];
}

function keyOf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return isI18nText(value) ? value.key : null;
}

function paramsOf(value: unknown): Record<string, unknown> | null {
  return isI18nText(value) ? { ...(value.params ?? {}) } : null;
}

describe('dp-on-trees', () => {
  it('recovers one maximum-weight independent set on a rooted chain', () => {
    const steps = collectSteps({
      kind: 'dp-on-trees',
      presetId: 'spec-chain',
      presetLabel: 'Spec Chain',
      presetDescription: 'Short rooted chain with a clearly best root choice.',
      rootId: 'a',
      nodes: [
        { id: 'a', label: 'A', weight: 5, parentId: null },
        { id: 'b', label: 'B', weight: 2, parentId: 'a' },
      ],
    });

    expect(steps[0]?.phase).toBe('init');
    expect(steps.at(-1)?.phase).toBe('complete');
    expect(keyOf(steps.at(-1)?.dp?.resultLabel)).toBe(
      'features.algorithms.runtime.dp.dpOnTrees.labels.resultBest',
    );
    expect(paramsOf(steps.at(-1)?.dp?.resultLabel)?.value).toBe(5);
    expect(keyOf(steps.at(-1)?.dp?.pathLabel)).toBe(
      'features.algorithms.runtime.dp.dpOnTrees.labels.pathValue',
    );
    expect(paramsOf(steps.at(-1)?.dp?.pathLabel)?.nodes).toBe('A');
    expect(
      steps.some(
        (step) =>
          keyOf(step.dp?.phaseLabel) ===
          'features.algorithms.runtime.dp.dpOnTrees.phases.backtrackChosen',
      ),
    ).toBe(true);
  });
});
